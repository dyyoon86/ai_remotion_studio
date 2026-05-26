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
- One scene = a coherent narrative unit (one topic, one moment, one idea). Usually ~1–4 sentences of narration.
- Aim for 3–8 scenes total for a typical script. More if the script is long.
- For each scene produce: a SHORT 3–12 char Korean title (descriptive, not generic), and the narration text (verbatim from the script, you may lightly join split lines but DO NOT paraphrase or invent content).
- If the script uses [section] or [헤더] markers, respect them as scene boundaries.
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
        {
          error:
            "codex CLI not found on PATH. Install OpenAI Codex CLI and run `codex login`.",
        },
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

  return NextResponse.json({ scenes });
}
