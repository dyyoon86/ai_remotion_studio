import path from "node:path";
import { mkdir, stat } from "node:fs/promises";
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";

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

const FRAMES_PER_SCENE = 90;
const FPS = 30;

export async function POST(req: Request) {
  let body: { scenes?: unknown; jobId?: unknown };
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

  const outDir = path.join(process.cwd(), "public", "renders");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `${jobId}.mp4`);
  const durationFrames = scenes.length * FRAMES_PER_SCENE;

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
        durationInFrames: durationFrames,
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
