import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { FFMPEG_PATH } from "@/lib/ffmpeg";
import { PYTHON_PATH } from "@/lib/python";
import type { TranscriptLine } from "@/lib/store";

export const runtime = "nodejs";

type SpawnResult = {
  code: number | null;
  stdout: string;
  stderr: string;
};

type WhisperSegment = {
  start: number;
  end: number;
  text: string;
};

type WhisperResult = {
  language?: string | null;
  duration?: number | null;
  segments?: WhisperSegment[];
};

type SceneRequestEntry = {
  id: string;
  index: number;
  narration: string;
};

type SceneAlignment = {
  sceneId: string;
  startSeconds: number;
  endSeconds: number;
  durationFrames: number;
  audioUrl: string;
};

const TRANSCRIBE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const CLIP_TIMEOUT_MS = 60 * 1000; // 1 minute total budget for clip extraction
const FPS = 30;
const MIN_FRAMES_PER_SCENE = 15;

function isEnoent(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  return (err as { code?: unknown }).code === "ENOENT";
}

function runChild(
  bin: string,
  args: string[],
  opts: { cwd?: string; timeoutMs?: number } = {},
): Promise<SpawnResult> {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    let child;
    try {
      child = spawn(bin, args, {
        cwd: opts.cwd,
        windowsHide: true,
      });
    } catch (e) {
      reject(e);
      return;
    }

    let timedOut = false;
    let timer: NodeJS.Timeout | null = null;
    if (opts.timeoutMs && opts.timeoutMs > 0) {
      timer = setTimeout(() => {
        timedOut = true;
        try {
          child.kill("SIGKILL");
        } catch {
          // ignore
        }
      }, opts.timeoutMs);
    }

    child.stdout.on("data", (b) => (stdout += b.toString()));
    child.stderr.on("data", (b) => (stderr += b.toString()));
    child.on("error", (err) => {
      if (timer) clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      if (timedOut) {
        const err = new Error("child process timed out") as Error & {
          code?: string;
        };
        err.code = "ETIMEDOUT";
        reject(err);
        return;
      }
      resolve({ code, stdout, stderr });
    });
  });
}

function formatTimestamp(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function tail(s: string, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(-n) : s;
}

async function findSourceFile(dir: string): Promise<string | null> {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return null;
  }
  const match = entries.find((name) => name.startsWith("source."));
  return match ? path.join(dir, match) : null;
}

function parseScenesFromBody(body: unknown): SceneRequestEntry[] | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const raw = (body as { scenes?: unknown }).scenes;
  if (!Array.isArray(raw)) return undefined;
  const out: SceneRequestEntry[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const obj = item as { id?: unknown; index?: unknown; narration?: unknown };
    if (typeof obj.id !== "string" || obj.id.trim() === "") continue;
    // Defensive: scene IDs must be path-safe (we use them as filenames).
    if (obj.id.includes("/") || obj.id.includes("\\") || obj.id.includes("..")) {
      continue;
    }
    const idx = typeof obj.index === "number" ? obj.index : 0;
    const narration = typeof obj.narration === "string" ? obj.narration : "";
    out.push({ id: obj.id, index: idx, narration });
  }
  return out.length > 0 ? out : undefined;
}

/**
 * Distribute STT segments across scenes proportionally by COUNT. Returns the
 * (startSeconds, endSeconds) for each scene in order. If a scene's bucket is
 * empty (fewer STT segments than scenes), fall back to dividing total duration
 * equally across scenes.
 */
function bucketSegments(
  segments: WhisperSegment[],
  sceneCount: number,
  totalDuration: number,
): { startSeconds: number; endSeconds: number }[] {
  const result: { startSeconds: number; endSeconds: number }[] = [];

  if (sceneCount <= 0) return result;

  const buckets: WhisperSegment[][] = Array.from(
    { length: sceneCount },
    () => [],
  );

  if (segments.length > 0) {
    for (let i = 0; i < segments.length; i++) {
      const bucketIdx = Math.min(
        sceneCount - 1,
        Math.floor((i / segments.length) * sceneCount),
      );
      buckets[bucketIdx].push(segments[i]);
    }
  }

  // Determine the total span we can fall back on. Prefer the whisper duration
  // when available; otherwise approximate from the last segment's end.
  const fallbackTotal =
    totalDuration > 0
      ? totalDuration
      : segments.length > 0
        ? segments[segments.length - 1].end
        : 0;
  const equalSlice = sceneCount > 0 ? fallbackTotal / sceneCount : 0;

  for (let i = 0; i < sceneCount; i++) {
    const bucket = buckets[i];
    if (bucket.length > 0) {
      let minStart = Infinity;
      let maxEnd = -Infinity;
      for (const seg of bucket) {
        if (seg.start < minStart) minStart = seg.start;
        if (seg.end > maxEnd) maxEnd = seg.end;
      }
      if (
        Number.isFinite(minStart) &&
        Number.isFinite(maxEnd) &&
        maxEnd > minStart
      ) {
        result.push({ startSeconds: minStart, endSeconds: maxEnd });
        continue;
      }
    }
    // Fallback: equal slice of fallbackTotal.
    const startSeconds = equalSlice * i;
    const endSeconds = equalSlice * (i + 1);
    result.push({ startSeconds, endSeconds });
  }

  return result;
}

export async function POST(req: Request): Promise<Response> {
  // 1) Parse + validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json(
      { error: `Invalid JSON body: ${(e as Error).message}` },
      { status: 400 },
    );
  }

  const videoId =
    typeof body === "object" && body !== null
      ? (body as { videoId?: unknown }).videoId
      : undefined;
  if (typeof videoId !== "string" || videoId.trim() === "") {
    return NextResponse.json(
      { error: "videoId is required (non-empty string)." },
      { status: 400 },
    );
  }
  // Defensive: prevent any path traversal.
  if (videoId.includes("/") || videoId.includes("\\") || videoId.includes("..")) {
    return NextResponse.json(
      { error: "Invalid videoId." },
      { status: 400 },
    );
  }

  const requestedScenes = parseScenesFromBody(body);

  // 2) Locate source file
  const uploadDir = path.join(process.cwd(), "public", "uploads", videoId);
  const sourcePath = await findSourceFile(uploadDir);
  if (!sourcePath) {
    return NextResponse.json(
      { error: "video not found" },
      { status: 404 },
    );
  }

  // 3) Extract mono 16kHz PCM audio
  const audioPath = path.join(uploadDir, "audio.wav");
  let ffmpegRes: SpawnResult;
  try {
    ffmpegRes = await runChild(
      FFMPEG_PATH,
      [
        "-y",
        "-i",
        sourcePath,
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-c:a",
        "pcm_s16le",
        audioPath,
      ],
      { timeoutMs: TRANSCRIBE_TIMEOUT_MS },
    );
  } catch (e) {
    if (isEnoent(e)) {
      console.error(`[transcribe] ffmpeg ENOENT at FFMPEG_PATH=${FFMPEG_PATH}`);
      return NextResponse.json(
        {
          error:
            "ffmpeg not found. Set FFMPEG_PATH env var or install ffmpeg.",
        },
        { status: 500 },
      );
    }
    console.error("[transcribe] ffmpeg spawn failure:", e);
    return NextResponse.json(
      { error: `audio extraction failed: ${(e as Error).message}` },
      { status: 500 },
    );
  }

  if (ffmpegRes.code !== 0) {
    const tailErr = tail(ffmpegRes.stderr, 500);
    console.error(
      `[transcribe] ffmpeg exit=${ffmpegRes.code}. stderr tail:\n${tailErr}`,
    );
    return NextResponse.json(
      {
        error: `audio extraction failed (ffmpeg exit ${ffmpegRes.code}). ${tailErr}`,
      },
      { status: 500 },
    );
  }

  // 4) Run faster-whisper via Python
  const scriptPath = path.join(process.cwd(), "scripts", "transcribe.py");
  let pyRes: SpawnResult;
  try {
    pyRes = await runChild(
      PYTHON_PATH,
      [scriptPath, audioPath, "--model", "base"],
      { cwd: process.cwd(), timeoutMs: TRANSCRIBE_TIMEOUT_MS },
    );
  } catch (e) {
    if (isEnoent(e)) {
      console.error(`[transcribe] python ENOENT at PYTHON_PATH=${PYTHON_PATH}`);
      return NextResponse.json(
        {
          error:
            "Python not found at PYTHON_PATH. Set PYTHON_PATH env var or install Python 3.12 at the expected location.",
        },
        { status: 500 },
      );
    }
    console.error("[transcribe] python spawn failure:", e);
    return NextResponse.json(
      { error: `transcription failed: ${(e as Error).message}` },
      { status: 500 },
    );
  }

  if (pyRes.code !== 0) {
    const tailErr = tail(pyRes.stderr, 500);
    console.error(
      `[transcribe] python exit=${pyRes.code}. stderr tail:\n${tailErr}\nstdout tail:\n${tail(pyRes.stdout, 500)}`,
    );
    return NextResponse.json(
      {
        error: `transcription failed (python exit ${pyRes.code}). ${tailErr}`,
      },
      { status: 500 },
    );
  }

  // 5) Parse JSON output
  let parsed: WhisperResult;
  try {
    parsed = JSON.parse(pyRes.stdout.trim()) as WhisperResult;
  } catch (e) {
    const stderrTail = tail(pyRes.stderr, 500);
    const stdoutTail = tail(pyRes.stdout, 500);
    console.error(
      `[transcribe] JSON parse failed: ${(e as Error).message}\nstderr tail:\n${stderrTail}\nstdout tail:\n${stdoutTail}`,
    );
    return NextResponse.json(
      {
        error: `failed to parse transcription output. stderr: ${stderrTail} | stdout: ${stdoutTail}`,
      },
      { status: 500 },
    );
  }

  const rawSegments = Array.isArray(parsed.segments) ? parsed.segments : [];

  // 6) Convert to TranscriptLine[]
  const transcript: TranscriptLine[] = rawSegments.map((seg, idx) => ({
    id: `stt-${idx + 1}`,
    timestamp: formatTimestamp(Number(seg?.start) || 0),
    text: typeof seg?.text === "string" ? seg.text.trim() : "",
    sceneId: undefined,
  }));

  // 7) Optional scene alignment + per-scene audio clip extraction.
  let sceneAlignment: SceneAlignment[] | undefined;
  if (requestedScenes && requestedScenes.length > 0) {
    const totalDuration =
      typeof parsed.duration === "number" && parsed.duration > 0
        ? parsed.duration
        : rawSegments.length > 0
          ? rawSegments[rawSegments.length - 1].end
          : 0;

    const buckets = bucketSegments(
      rawSegments,
      requestedScenes.length,
      totalDuration,
    );

    const clipsDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "stt-clips",
      videoId,
    );
    try {
      await mkdir(clipsDir, { recursive: true });
    } catch (e) {
      console.error("[transcribe] mkdir stt-clips failed:", e);
    }

    const alignments: SceneAlignment[] = [];
    const startedAt = Date.now();

    for (let i = 0; i < requestedScenes.length; i++) {
      const scene = requestedScenes[i];
      const bucket = buckets[i] ?? { startSeconds: 0, endSeconds: 0 };
      const startSeconds = Math.max(0, bucket.startSeconds);
      let endSeconds = Math.max(startSeconds, bucket.endSeconds);
      // Guard against zero-length spans.
      if (endSeconds <= startSeconds) {
        endSeconds = startSeconds + MIN_FRAMES_PER_SCENE / FPS;
      }

      const durationFrames = Math.max(
        MIN_FRAMES_PER_SCENE,
        Math.ceil((endSeconds - startSeconds) * FPS),
      );

      const clipFileName = `${scene.id}.mp3`;
      const clipLocalPath = path.join(clipsDir, clipFileName);
      const audioUrl = `/uploads/stt-clips/${videoId}/${clipFileName}`;

      // Respect overall 1-minute budget for clip extraction.
      const elapsed = Date.now() - startedAt;
      const remaining = CLIP_TIMEOUT_MS - elapsed;
      if (remaining <= 0) {
        console.warn(
          `[transcribe] clip extraction budget exhausted at scene ${scene.id}; skipping remaining clips.`,
        );
        break;
      }

      try {
        const clipRes = await runChild(
          FFMPEG_PATH,
          [
            "-y",
            "-ss",
            startSeconds.toFixed(3),
            "-to",
            endSeconds.toFixed(3),
            "-i",
            audioPath,
            "-c:a",
            "libmp3lame",
            "-b:a",
            "128k",
            clipLocalPath,
          ],
          { timeoutMs: Math.min(remaining, 30 * 1000) },
        );
        if (clipRes.code !== 0) {
          console.error(
            `[transcribe] clip ffmpeg exit=${clipRes.code} for scene ${scene.id}. stderr tail:\n${tail(clipRes.stderr, 400)}`,
          );
          continue;
        }
      } catch (e) {
        console.error(
          `[transcribe] clip extraction failed for scene ${scene.id}:`,
          e,
        );
        continue;
      }

      alignments.push({
        sceneId: scene.id,
        startSeconds,
        endSeconds,
        durationFrames,
        audioUrl,
      });
    }

    if (alignments.length > 0) {
      sceneAlignment = alignments;
    }
  }

  return NextResponse.json({
    transcript,
    language: parsed.language ?? undefined,
    durationSeconds:
      typeof parsed.duration === "number" ? parsed.duration : undefined,
    segmentCount: transcript.length,
    ...(sceneAlignment ? { sceneAlignment } : {}),
  });
}
