import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
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

const TRANSCRIBE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

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

  return NextResponse.json({
    transcript,
    language: parsed.language ?? undefined,
    durationSeconds:
      typeof parsed.duration === "number" ? parsed.duration : undefined,
    segmentCount: transcript.length,
  });
}
