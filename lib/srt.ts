import type { Scene } from "./store";

const SCENE_SECONDS = 3;

function fmt(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

export function buildSrt(
  scenes: Pick<Scene, "id" | "index" | "narration">[],
): string {
  return scenes
    .map((s, i) => {
      const start = i * SCENE_SECONDS;
      const end = start + SCENE_SECONDS;
      return `${i + 1}\n${fmt(start)} --> ${fmt(end)}\n${s.narration.trim()}\n`;
    })
    .join("\n");
}
