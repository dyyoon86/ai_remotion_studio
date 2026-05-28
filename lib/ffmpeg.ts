import { existsSync } from "node:fs";

const FALLBACK =
  "C:\\Users\\duyoung\\AppData\\Local\\Programs\\Python\\Python312\\Lib\\site-packages\\imageio_ffmpeg\\binaries\\ffmpeg-win-x86_64-v7.1.exe";

export const FFMPEG_PATH =
  process.env.FFMPEG_PATH || (existsSync(FALLBACK) ? FALLBACK : "ffmpeg");

/**
 * Parses the `Duration: HH:MM:SS.ms` line from an ffmpeg stderr capture.
 * Returns total seconds (float) or null if not found / unparseable.
 */
export function parseFfmpegDuration(stderr: string): number | null {
  const m = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const s = parseFloat(m[3]);
  if (Number.isNaN(h) || Number.isNaN(min) || Number.isNaN(s)) return null;
  return h * 3600 + min * 60 + s;
}
