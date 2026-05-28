import type { Scene } from "./store";

const FPS = 30;
const DEFAULT_FRAMES = 90;

function fmt(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

export function buildSrt(
  scenes: Pick<Scene, "id" | "index" | "narration" | "durationFrames">[],
): string {
  let cursorFrames = 0;
  return scenes
    .map((s, i) => {
      const frames =
        s.durationFrames && s.durationFrames > 0
          ? s.durationFrames
          : DEFAULT_FRAMES;
      const start = cursorFrames / FPS;
      const end = (cursorFrames + frames) / FPS;
      cursorFrames += frames;
      return `${i + 1}\n${fmt(start)} --> ${fmt(end)}\n${s.narration.trim()}\n`;
    })
    .join("\n");
}
