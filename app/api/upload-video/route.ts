import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { FFMPEG_PATH, parseFfmpegDuration } from "@/lib/ffmpeg";

const ALLOWED_EXTS = new Set([".mp4", ".mov", ".webm", ".mkv", ".m4v"]);
const MAX_BYTES = 200 * 1024 * 1024; // 200 MB
const THUMB_COUNT = 8;

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

function formatDurationDisplay(totalSeconds: number): string {
  const total = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  if (h > 0) {
    return `${h}:${mm}:${ss}`;
  }
  return `${m}:${ss}`;
}

function isFfmpegNotFoundError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const code = (err as { code?: unknown }).code;
  return code === "ENOENT";
}

export async function POST(req: Request): Promise<Response> {
  let form: FormData;
  try {
    form = await req.formData();
  } catch (e) {
    return NextResponse.json(
      { error: `Invalid multipart form: ${(e as Error).message}` },
      { status: 400 },
    );
  }

  const fileEntry = form.get("file");
  if (!fileEntry || typeof fileEntry === "string") {
    return NextResponse.json(
      { error: "Missing 'file' field in multipart form." },
      { status: 400 },
    );
  }
  const file = fileEntry as File;

  const name = file.name || "upload";
  const ext = path.extname(name).toLowerCase();
  if (!ALLOWED_EXTS.has(ext)) {
    return NextResponse.json(
      {
        error: `Unsupported file extension '${ext}'. Allowed: ${Array.from(
          ALLOWED_EXTS,
        ).join(", ")}`,
      },
      { status: 400 },
    );
  }
  const ctype = (file.type || "").toLowerCase();
  if (ctype && !ctype.startsWith("video/")) {
    return NextResponse.json(
      { error: `Unsupported content-type '${file.type}'. Must be video/*.` },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      {
        error: `File too large: ${file.size} bytes (max ${MAX_BYTES}).`,
      },
      { status: 413 },
    );
  }
  if (file.size <= 0) {
    return NextResponse.json(
      { error: "Empty file." },
      { status: 400 },
    );
  }

  const id = crypto.randomUUID();
  const dir = path.join(process.cwd(), "public", "uploads", id);
  const sourceName = `source${ext}`;
  const sourcePath = path.join(dir, sourceName);

  try {
    await mkdir(dir, { recursive: true });
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(sourcePath, buf);
  } catch (e) {
    return NextResponse.json(
      { error: `Failed to store file: ${(e as Error).message}` },
      { status: 500 },
    );
  }

  // 1) Get duration via probe call (ffmpeg writes meta to stderr).
  let probe: SpawnResult;
  try {
    probe = await runFfmpeg(["-i", sourcePath]);
  } catch (e) {
    if (isFfmpegNotFoundError(e)) {
      return NextResponse.json(
        {
          error: `ffmpeg not found at FFMPEG_PATH=${FFMPEG_PATH}. Set FFMPEG_PATH or install ffmpeg.`,
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: `ffmpeg probe failed: ${(e as Error).message}` },
      { status: 500 },
    );
  }

  const durationSeconds = parseFfmpegDuration(probe.stderr);
  if (durationSeconds == null || durationSeconds <= 0) {
    const tail = probe.stderr.slice(-1200);
    return NextResponse.json(
      {
        error: `Failed to parse duration from ffmpeg output. stderr tail:\n${tail}`,
      },
      { status: 500 },
    );
  }

  // 2) Extract thumbnails — 8 frames, skipping first/last 5%.
  const skip = durationSeconds * 0.05;
  const usable = Math.max(0.01, durationSeconds - skip * 2);
  const thumbnails: string[] = [];
  const denom = Math.max(1, THUMB_COUNT - 1);
  for (let i = 0; i < THUMB_COUNT; i++) {
    const t = skip + (usable * i) / denom;
    const nn = String(i).padStart(2, "0");
    const outName = `thumb-${nn}.jpg`;
    const outPath = path.join(dir, outName);

    let frameRes: SpawnResult;
    try {
      frameRes = await runFfmpeg([
        "-ss",
        t.toFixed(3),
        "-i",
        sourcePath,
        "-frames:v",
        "1",
        "-vf",
        "scale=480:-2",
        "-y",
        outPath,
      ]);
    } catch (e) {
      if (isFfmpegNotFoundError(e)) {
        return NextResponse.json(
          {
            error: `ffmpeg not found at FFMPEG_PATH=${FFMPEG_PATH}. Set FFMPEG_PATH or install ffmpeg.`,
          },
          { status: 500 },
        );
      }
      return NextResponse.json(
        { error: `ffmpeg thumbnail extraction failed: ${(e as Error).message}` },
        { status: 500 },
      );
    }
    // ffmpeg exits 0 on success. Some non-zero exits still produce a frame; treat
    // missing-file or non-zero+no-frame as failure.
    if (frameRes.code !== 0) {
      const tail = frameRes.stderr.slice(-800);
      return NextResponse.json(
        {
          error: `ffmpeg exited with code ${frameRes.code} extracting thumb ${nn}. stderr tail:\n${tail}`,
        },
        { status: 500 },
      );
    }
    thumbnails.push(`/uploads/${id}/${outName}`);
  }

  const videoUrl = `/uploads/${id}/${sourceName}`;
  const durationDisplay = formatDurationDisplay(durationSeconds);

  return NextResponse.json({
    id,
    name,
    sizeBytes: file.size,
    durationSeconds,
    durationDisplay,
    videoUrl,
    thumbnails,
  });
}
