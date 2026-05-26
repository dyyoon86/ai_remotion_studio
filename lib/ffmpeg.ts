import { existsSync } from "node:fs";

const FALLBACK =
  "C:\\Users\\duyoung\\AppData\\Local\\Programs\\Python\\Python312\\Lib\\site-packages\\imageio_ffmpeg\\binaries\\ffmpeg-win-x86_64-v7.1.exe";

export const FFMPEG_PATH =
  process.env.FFMPEG_PATH || (existsSync(FALLBACK) ? FALLBACK : "ffmpeg");
