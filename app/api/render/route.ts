import path from "node:path";
import { mkdir, stat, rename, unlink, access } from "node:fs/promises";
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import { FFMPEG_PATH } from "@/lib/ffmpeg";

export const runtime = "nodejs";
export const maxDuration = 300; // Next.js hint, harmless

let cachedServeUrl: string | null = null;
let bundlingPromise: Promise<string> | null = null;

async function getServeUrl(): Promise<string> {
  if (cachedServeUrl) return cachedServeUrl;
  if (bundlingPromise) return bundlingPromise;
  bundlingPromise = bundle({
    entryPoint: path.join(process.cwd(), "remotion", "index.ts"),
    webpackOverride: (cfg) => cfg,
  });
  const url = await bundlingPromise;
  cachedServeUrl = url;
  bundlingPromise = null;
  return url;
}

const DEFAULT_FRAMES_PER_SCENE = 90;
const FPS = 30;

type SceneInput = {
  id: string;
  durationFrames?: number;
  audioUrl?: string;
};

type SpawnResult = {
  code: number | null;
  stdout: string;
  stderr: string;
};

function runFfmpeg(args: string[]): Promise<SpawnResult> {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    let child;
    try {
      child = spawn(FFMPEG_PATH, args, { windowsHide: true });
    } catch (e) {
      reject(e);
      return;
    }
    child.stdout.on("data", (b) => (stdout += b.toString()));
    child.stderr.on("data", (b) => (stderr += b.toString()));
    child.on("error", (err) => reject(err));
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

function sceneFrames(s: SceneInput): number {
  return s.durationFrames && s.durationFrames > 0
    ? s.durationFrames
    : DEFAULT_FRAMES_PER_SCENE;
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolves an /uploads/<id>/source.<ext> URL to an on-disk file in public/.
 * Returns null if the input is not a usable uploads url or the file is missing.
 */
async function resolveSourceVideoPath(
  sourceVideoUrl: string | undefined,
): Promise<string | null> {
  if (typeof sourceVideoUrl !== "string" || sourceVideoUrl.length === 0) {
    return null;
  }
  if (!sourceVideoUrl.startsWith("/uploads/")) return null;
  const rel = sourceVideoUrl.replace(/^\/+/, "");
  const local = path.join(process.cwd(), "public", rel);
  if (!(await fileExists(local))) return null;
  return local;
}

/**
 * Extracts the audio track from the original uploaded source video into an
 * mp3 file. Returns the output path on success, null on any failure.
 */
async function extractSourceAudio(opts: {
  sourceVideoPath: string;
  outPath: string;
}): Promise<string | null> {
  const { sourceVideoPath, outPath } = opts;
  try {
    const res = await runFfmpeg([
      "-y",
      "-i",
      sourceVideoPath,
      "-vn",
      "-ac",
      "2",
      "-ar",
      "44100",
      "-c:a",
      "libmp3lame",
      "-b:a",
      "192k",
      outPath,
    ]);
    if (res.code !== 0) {
      console.error(
        `[render] ffmpeg source-audio extract failed exit=${res.code}. stderr tail:\n${res.stderr.slice(-800)}`,
      );
      return null;
    }
    if (!(await fileExists(outPath))) return null;
    return outPath;
  } catch (e) {
    console.error("[render] source-audio extract threw:", e);
    return null;
  }
}

/**
 * Mixes a foreground combined mp3 (TTS/STT) with a background mp3 (original
 * video audio) at low volume. Returns the output path on success, null on any
 * failure (caller should fall back to the foreground-only mp3).
 */
async function mixBackgroundAudio(opts: {
  foregroundPath: string;
  backgroundPath: string;
  outPath: string;
  backgroundVolume: number;
}): Promise<string | null> {
  const { foregroundPath, backgroundPath, outPath, backgroundVolume } = opts;
  try {
    const res = await runFfmpeg([
      "-y",
      "-i",
      foregroundPath,
      "-i",
      backgroundPath,
      "-filter_complex",
      `[1:a]volume=${backgroundVolume}[bg];[0:a][bg]amix=inputs=2:duration=longest:dropout_transition=0[a]`,
      "-map",
      "[a]",
      "-c:a",
      "libmp3lame",
      "-b:a",
      "192k",
      outPath,
    ]);
    if (res.code !== 0) {
      console.error(
        `[render] ffmpeg amix failed exit=${res.code}. stderr tail:\n${res.stderr.slice(-800)}`,
      );
      return null;
    }
    if (!(await fileExists(outPath))) return null;
    return outPath;
  } catch (e) {
    console.error("[render] amix threw:", e);
    return null;
  }
}

/**
 * Concatenates per-scene mp3 audio files into a single mp3 and muxes it into
 * the silent mp4. Replaces the silent mp4 in place with the muxed result.
 *
 * If `mixOriginalAudio` is true and `sourceVideoPath` resolves to a usable
 * file, the original video's audio track is extracted and mixed under the
 * TTS/STT track at 0.25 volume. On any failure during the extra mixing step,
 * gracefully falls back to TTS-only audio.
 *
 * If anything fails, logs and leaves the original silent mp4 untouched
 * (graceful degradation).
 */
async function mixAudioIntoVideo(opts: {
  videoPath: string;
  audioPaths: string[];
  jobId: string;
  mixOriginalAudio?: boolean;
  sourceVideoPath?: string | null;
}): Promise<void> {
  const {
    videoPath,
    audioPaths,
    jobId,
    mixOriginalAudio,
    sourceVideoPath,
  } = opts;
  if (audioPaths.length === 0) return;

  const renderDir = path.dirname(videoPath);
  const tmpCombined = path.join(renderDir, `${jobId}.audio.mp3`);
  const tmpSourceAudio = path.join(renderDir, `${jobId}.source-audio.mp3`);
  const tmpMixed = path.join(renderDir, `${jobId}.audio-mixed.mp3`);
  const tmpMuxed = path.join(renderDir, `${jobId}.muxed.mp4`);

  let finalAudioPath: string = tmpCombined;

  try {
    // 1) Concat all per-scene audio into a single mp3 using filter_complex.
    const concatArgs: string[] = ["-y"];
    for (const a of audioPaths) {
      concatArgs.push("-i", a);
    }
    const n = audioPaths.length;
    if (n === 1) {
      // Single input: just re-encode (copy could fail if container quirks).
      concatArgs.push(
        "-c:a",
        "libmp3lame",
        "-b:a",
        "192k",
        "-vn",
        tmpCombined,
      );
    } else {
      const inputs = audioPaths.map((_, i) => `[${i}:a]`).join("");
      const filter = `${inputs}concat=n=${n}:v=0:a=1[a]`;
      concatArgs.push(
        "-filter_complex",
        filter,
        "-map",
        "[a]",
        "-c:a",
        "libmp3lame",
        "-b:a",
        "192k",
        tmpCombined,
      );
    }

    const concatRes = await runFfmpeg(concatArgs);
    if (concatRes.code !== 0) {
      console.error(
        `[render] ffmpeg audio concat failed exit=${concatRes.code}. stderr tail:\n${concatRes.stderr.slice(-800)}`,
      );
      return;
    }

    // 1b) Optional: extract original audio and amix at low volume.
    if (mixOriginalAudio && sourceVideoPath) {
      const extracted = await extractSourceAudio({
        sourceVideoPath,
        outPath: tmpSourceAudio,
      });
      if (extracted) {
        const mixed = await mixBackgroundAudio({
          foregroundPath: tmpCombined,
          backgroundPath: extracted,
          outPath: tmpMixed,
          backgroundVolume: 0.25,
        });
        if (mixed) {
          finalAudioPath = tmpMixed;
        } else {
          console.warn(
            "[render] background mix failed — falling back to combined.mp3 only.",
          );
        }
      } else {
        console.warn(
          "[render] source-audio extraction failed — falling back to combined.mp3 only.",
        );
      }
    }

    // 2) Mux: video stream copy + AAC audio re-encode.
    const muxRes = await runFfmpeg([
      "-y",
      "-i",
      videoPath,
      "-i",
      finalAudioPath,
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-shortest",
      tmpMuxed,
    ]);
    if (muxRes.code !== 0) {
      console.error(
        `[render] ffmpeg mux failed exit=${muxRes.code}. stderr tail:\n${muxRes.stderr.slice(-800)}`,
      );
      return;
    }

    // 3) Replace silent mp4 with muxed mp4.
    await unlink(videoPath).catch(() => undefined);
    await rename(tmpMuxed, videoPath);
  } catch (e) {
    console.error("[render] audio mix step failed:", e);
  } finally {
    // Cleanup intermediate audio + leftover mp4 (mp4 already moved or left in place).
    await unlink(tmpCombined).catch(() => undefined);
    await unlink(tmpSourceAudio).catch(() => undefined);
    await unlink(tmpMixed).catch(() => undefined);
    await unlink(tmpMuxed).catch(() => undefined);
  }
}

export async function POST(req: Request) {
  let body: {
    scenes?: unknown;
    jobId?: unknown;
    mixOriginalAudio?: unknown;
    sourceVideoUrl?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const scenes = body.scenes;
  if (!Array.isArray(scenes) || scenes.length === 0) {
    return NextResponse.json(
      { error: "scenes array required" },
      { status: 400 },
    );
  }
  const jobId =
    typeof body.jobId === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(body.jobId)
      ? body.jobId
      : crypto.randomUUID();
  const mixOriginalAudio = body.mixOriginalAudio === true;
  const sourceVideoUrl =
    typeof body.sourceVideoUrl === "string" ? body.sourceVideoUrl : undefined;

  const outDir = path.join(process.cwd(), "public", "renders");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `${jobId}.mp4`);

  // Compute variable durationInFrames from the scene list.
  const sceneInputs = scenes as SceneInput[];
  const durationFrames = sceneInputs.reduce(
    (acc, s) => acc + sceneFrames(s),
    0,
  );

  try {
    const serveUrl = await getServeUrl();
    const composition = await selectComposition({
      serveUrl,
      id: "fullVideo",
      inputProps: { scenes },
    });

    await renderMedia({
      composition: {
        ...composition,
        durationInFrames: Math.max(1, durationFrames),
      },
      serveUrl,
      codec: "h264",
      outputLocation: outPath,
      inputProps: { scenes },
      concurrency: null,
      chromiumOptions: {
        // headless: true is default; just leave defaults
      },
    });

    // Attempt to mix in TTS audio if every scene has an audioUrl pointing to a
    // file under public/uploads/tts/. If any audio is missing, skip mixing
    // (graceful degradation).
    const audioPaths: string[] = [];
    let allHaveAudio = sceneInputs.length > 0;
    for (const s of sceneInputs) {
      const url = s.audioUrl;
      if (
        typeof url !== "string" ||
        (!url.startsWith("/uploads/tts/") &&
          !url.startsWith("/uploads/stt-clips/"))
      ) {
        allHaveAudio = false;
        break;
      }
      // Strip leading slash, join under public/.
      const rel = url.replace(/^\/+/, "");
      const local = path.join(process.cwd(), "public", rel);
      if (!(await fileExists(local))) {
        allHaveAudio = false;
        break;
      }
      audioPaths.push(local);
    }

    if (allHaveAudio && audioPaths.length === sceneInputs.length) {
      // Resolve source video path for optional background-audio mix.
      const sourceVideoPath = mixOriginalAudio
        ? await resolveSourceVideoPath(sourceVideoUrl)
        : null;
      if (mixOriginalAudio && !sourceVideoPath) {
        console.warn(
          `[render] mixOriginalAudio requested but sourceVideoUrl='${sourceVideoUrl ?? ""}' did not resolve to a usable file — proceeding without background mix.`,
        );
      }

      await mixAudioIntoVideo({
        videoPath: outPath,
        audioPaths,
        jobId,
        mixOriginalAudio,
        sourceVideoPath,
      });
    } else {
      console.warn(
        `[render] skipping audio mix — not all scenes have valid audioUrl (have ${audioPaths.length}/${sceneInputs.length}).`,
      );
    }

    const s = await stat(outPath);
    return NextResponse.json({
      jobId,
      url: `/renders/${jobId}.mp4`,
      durationFrames,
      durationSeconds: durationFrames / FPS,
      sizeBytes: s.size,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[render] failed:", msg);
    return NextResponse.json({ error: msg.slice(0, 500) }, { status: 500 });
  }
}
