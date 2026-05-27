import { NextResponse } from "next/server";
import { runCodex, stripCodeFences } from "@/lib/codex";

// Force Node.js runtime — we spawn a subprocess (codex CLI), which is not
// supported on the Edge runtime.
export const runtime = "nodejs";

type SegmentedScene = {
  title: string;
  narration: string;
};

function buildPrompt(userScript: string): string {
  return `You are a video scriptwriter assistant. Segment the following Korean (or any-language) script into video SCENES.

Rules:
- One scene = one narrative beat. Each sentence or short paragraph is usually its own scene.
- HARD MINIMUM: if the script contains 3 or more standalone sentences (separated by periods, question marks, exclamation marks, or line breaks), produce AT LEAST 3 scenes. Never collapse a multi-sentence script into a single scene.
- Aim for 4–8 scenes for a typical script. Lean toward MORE scenes, not fewer.
- For each scene produce: a SHORT 3–12 char Korean title (descriptive of THAT scene only, not generic), and the narration text (verbatim from the script, lightly joined if a sentence was split across lines; DO NOT paraphrase or invent).
- If the script uses [section] or [헤더] markers, respect them as scene boundaries, but additionally split LONG sections further if they have multiple sentences.
- Output STRICT JSON only, no prose, no code fences:

{"scenes":[{"title":"...","narration":"..."}, ...]}

Script:
<<<
${userScript}
>>>`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const script =
    body && typeof body === "object"
      ? (body as { script?: unknown }).script
      : undefined;

  if (typeof script !== "string" || script.trim() === "") {
    return NextResponse.json({ error: "script is empty" }, { status: 400 });
  }

  const prompt = buildPrompt(script);

  let rawText: string;
  try {
    rawText = await runCodex(prompt, 120_000);
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") {
      return NextResponse.json(
        { error: e.message },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: e.message ?? String(err) },
      { status: 500 },
    );
  }

  const cleaned = stripCodeFences(rawText);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    return NextResponse.json(
      {
        error: `Failed to parse model JSON: ${
          err instanceof Error ? err.message : String(err)
        }. Raw (first 300 chars): ${cleaned.slice(0, 300)}`,
      },
      { status: 500 },
    );
  }

  const rawScenes = (parsed as { scenes?: unknown }).scenes;
  if (!Array.isArray(rawScenes)) {
    return NextResponse.json(
      {
        error: `Model response missing "scenes" array. Raw: ${cleaned.slice(
          0,
          300,
        )}`,
      },
      { status: 500 },
    );
  }

  const scenes: SegmentedScene[] = [];
  for (const s of rawScenes) {
    if (!s || typeof s !== "object") continue;
    const sObj = s as Record<string, unknown>;
    const title = sObj.title;
    const narration = sObj.narration;
    if (
      typeof title === "string" &&
      typeof narration === "string" &&
      title.trim() !== "" &&
      narration.trim() !== ""
    ) {
      scenes.push({ title: title.trim(), narration: narration.trim() });
    }
  }

  if (scenes.length === 0) {
    return NextResponse.json(
      {
        error: `No valid scenes returned from model. Raw: ${cleaned.slice(0, 300)}`,
      },
      { status: 500 },
    );
  }

  // Defensive logging: warn when the model under-segments a multi-sentence script
  if (scenes.length === 1) {
    const sentenceCount = (script.match(/[.!?。\n]+/g) ?? [])
      .map((s) => s.trim())
      .filter((s) => s.length > 0).length;
    if (sentenceCount >= 3) {
      console.warn(
        `[segment-script] Model returned only 1 scene for a script containing ${sentenceCount} sentence boundaries. Consider revising the prompt or input.`,
      );
    }
  }

  return NextResponse.json({ scenes });
}
