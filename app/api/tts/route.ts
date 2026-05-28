import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { mkdir, writeFile, unlink, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { FFMPEG_PATH, parseFfmpegDuration } from "@/lib/ffmpeg";
import { PYTHON_PATH } from "@/lib/python";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_SCENES = 32;
const SCENE_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const DEFAULT_VOICE = "ko-KR-SunHiNeural";
const PER_SCENE_TIMEOUT_MS = 120_000;
const FPS = 30;
const MIN_FRAMES = 15;

type SpawnResult = {
  code: number | null;
  stdout: string;
  stderr: string;
};

function isEnoent(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  return (err as { code?: unknown }).code === "ENOENT";
}

function runChild(
  bin: string,
  args: string[],
  opts: {
    cwd?: string;
    timeoutMs?: number;
    env?: NodeJS.ProcessEnv;
  } = {},
): Promise<SpawnResult> {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    let child;
    try {
      child = spawn(bin, args, {
        cwd: opts.cwd,
        windowsHide: true,
        env: opts.env,
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

function tail(s: string, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(-n) : s;
}

type SceneInput = { id: string; narration: string };
type TtsResult = {
  sceneId: string;
  audioUrl: string;
  durationSeconds: number;
  durationFrames: number;
};

export async function POST(req: Request): Promise<Response> {
  // 1) Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json(
      { error: `Invalid JSON body: ${(e as Error).message}` },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Body must be an object." },
      { status: 400 },
    );
  }

  const rawScenes = (body as { scenes?: unknown }).scenes;
  if (!Array.isArray(rawScenes) || rawScenes.length === 0) {
    return NextResponse.json(
      { error: "scenes array (non-empty) is required." },
      { status: 400 },
    );
  }
  if (rawScenes.length > MAX_SCENES) {
    return NextResponse.json(
      { error: `Too many scenes (max ${MAX_SCENES}).` },
      { status: 400 },
    );
  }

  const scenes: SceneInput[] = [];
  for (let i = 0; i < rawScenes.length; i++) {
    const item = rawScenes[i];
    if (typeof item !== "object" || item === null) {
      return NextResponse.json(
        { error: `scenes[${i}] must be an object.` },
        { status: 400 },
      );
    }
    const id = (item as { id?: unknown }).id;
    const narration = (item as { narration?: unknown }).narration;
    if (typeof id !== "string" || !SCENE_ID_RE.test(id)) {
      return NextResponse.json(
        {
          error: `scenes[${i}].id is invalid (must match ${SCENE_ID_RE.source}).`,
        },
        { status: 400 },
      );
    }
    if (typeof narration !== "string" || narration.trim() === "") {
      return NextResponse.json(
        { error: `scenes[${i}].narration must be a non-empty string.` },
        { status: 400 },
      );
    }
    scenes.push({ id, narration: narration.trim() });
  }

  const voiceRaw = (body as { voice?: unknown }).voice;
  const voice =
    typeof voiceRaw === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(voiceRaw)
      ? voiceRaw
      : DEFAULT_VOICE;

  // 2) Prepare output dir
  const ttsDir = path.join(process.cwd(), "public", "uploads", "tts");
  try {
    await mkdir(ttsDir, { recursive: true });
  } catch (e) {
    return NextResponse.json(
      { error: `Failed to create tts dir: ${(e as Error).message}` },
      { status: 500 },
    );
  }

  const scriptPath = path.join(process.cwd(), "scripts", "tts.py");
  const env: NodeJS.ProcessEnv = { ...process.env, PYTHONHTTPSVERIFY: "0" };

  const results: TtsResult[] = [];
  const tmpFiles: string[] = [];

  try {
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const outPath = path.join(ttsDir, `${scene.id}.mp3`);

      // Write narration to a temp file (UTF-8) to avoid argv encoding issues
      // on Windows with Korean text.
      const tmpFile = path.join(
        tmpdir(),
        `tts-${crypto.randomBytes(8).toString("hex")}.txt`,
      );
      tmpFiles.push(tmpFile);
      await writeFile(tmpFile, scene.narration, { encoding: "utf-8" });

      // Run python tts.py @<tmpFile> <voice> <outPath>
      let pyRes: SpawnResult;
      try {
        pyRes = await runChild(
          PYTHON_PATH,
          [scriptPath, `@${tmpFile}`, voice, outPath],
          { cwd: process.cwd(), timeoutMs: PER_SCENE_TIMEOUT_MS, env },
        );
      } catch (e) {
        if (isEnoent(e)) {
          return NextResponse.json(
            {
              error: `Python not found at PYTHON_PATH=${PYTHON_PATH}. Set PYTHON_PATH env var.`,
            },
            { status: 500 },
          );
        }
        return NextResponse.json(
          {
            error: `TTS spawn failed (scene ${scene.id}): ${(e as Error).message}`,
          },
          { status: 500 },
        );
      }

      if (pyRes.code !== 0) {
        const stderrTail = tail(pyRes.stderr, 800);
        const stdoutTail = tail(pyRes.stdout, 400);
        console.error(
          `[tts] python exit=${pyRes.code} (scene ${scene.id}). stderr:\n${stderrTail}\nstdout:\n${stdoutTail}`,
        );
        // Detect SSL/cert specific errors and hint about PYTHONHTTPSVERIFY.
        const combined = `${stderrTail}\n${stdoutTail}`;
        if (
          /SSL|certificate|CERTIFICATE_VERIFY|self[- ]signed/i.test(combined)
        ) {
          return NextResponse.json(
            {
              error:
                "TTS 생성 실패 (네트워크/인증서 문제). PYTHONHTTPSVERIFY 환경변수가 0 인지 확인하세요.",
            },
            { status: 500 },
          );
        }
        return NextResponse.json(
          {
            error: `TTS 생성 실패 (scene ${scene.id}): ${stderrTail || "exit code " + pyRes.code}`,
          },
          { status: 500 },
        );
      }

      // 3) Measure duration with ffmpeg
      let probeRes: SpawnResult;
      try {
        probeRes = await runChild(FFMPEG_PATH, ["-i", outPath, "-f", "null", "-"]);
      } catch (e) {
        if (isEnoent(e)) {
          return NextResponse.json(
            {
              error: `ffmpeg not found at FFMPEG_PATH=${FFMPEG_PATH}. Set FFMPEG_PATH or install ffmpeg.`,
            },
            { status: 500 },
          );
        }
        return NextResponse.json(
          {
            error: `ffmpeg probe failed (scene ${scene.id}): ${(e as Error).message}`,
          },
          { status: 500 },
        );
      }

      const durationSeconds = parseFfmpegDuration(probeRes.stderr);
      if (durationSeconds == null || durationSeconds <= 0) {
        const stderrTail = tail(probeRes.stderr, 800);
        return NextResponse.json(
          {
            error: `Failed to parse duration for scene ${scene.id}. stderr tail:\n${stderrTail}`,
          },
          { status: 500 },
        );
      }

      const durationFrames = Math.max(
        MIN_FRAMES,
        Math.ceil(durationSeconds * FPS),
      );

      results.push({
        sceneId: scene.id,
        audioUrl: `/uploads/tts/${scene.id}.mp3`,
        durationSeconds,
        durationFrames,
      });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[tts] unexpected failure:", e);
    return NextResponse.json(
      { error: `TTS 생성 실패: ${msg}` },
      { status: 500 },
    );
  } finally {
    // Best-effort cleanup of temp text files.
    await Promise.all(
      tmpFiles.map(async (p) => {
        try {
          await unlink(p);
        } catch {
          // ignore
        }
      }),
    );
  }

  // Sanity check that all output files exist (already implied by ffmpeg probe, but explicit)
  for (const r of results) {
    try {
      const full = path.join(process.cwd(), "public", "uploads", "tts", `${r.sceneId}.mp3`);
      await stat(full);
    } catch (e) {
      return NextResponse.json(
        {
          error: `TTS output missing for scene ${r.sceneId}: ${(e as Error).message}`,
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ tts: results });
}
