import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TEMPLATE_CATALOG } from "@/lib/template-catalog";
import type { TemplateId } from "@/lib/store";

type SceneInput = {
  id: string;
  title: string;
  narration: string;
  current?: TemplateId;
};

type Candidate = {
  templateId: TemplateId;
  reason: string;
};

type Recommendation = {
  sceneId: string;
  candidates: Candidate[];
};

const KNOWN_TEMPLATE_IDS = new Set<TemplateId>(
  TEMPLATE_CATALOG.map((t) => t.id),
);

function buildPrompt(scenes: SceneInput[]): string {
  const catalogLines = TEMPLATE_CATALOG.map(
    (t) => `- id="${t.id}" | label="${t.label}" | vibe: ${t.vibe} | bestFor: ${t.bestFor}`,
  ).join("\n");

  const sceneLines = scenes
    .map((s, i) => {
      const cur = s.current ? ` (current: ${s.current})` : "";
      return `[Scene ${i + 1}] id="${s.id}"${cur}\n  title: ${s.title}\n  narration: ${s.narration}`;
    })
    .join("\n\n");

  return `You are a video template recommendation expert for a Korean short-form video studio.

You will see (A) a catalog of 36 Remotion templates with their vibe and best-fit description, and (B) a list of video scenes (each with a title and narration text in Korean). Your job: for EACH scene, choose the 3 BEST templateIds from the catalog and give a SHORT 1-sentence Korean reason for each pick. Rank candidates from best to worst.

### A. Template Catalog (36 templates)
${catalogLines}

### B. Scenes
${sceneLines}

### Output format (STRICT)
Return ONLY valid JSON matching this exact shape — no prose, no markdown, no code fences:

{
  "recommendations": [
    {
      "sceneId": "<the scene id from input>",
      "candidates": [
        { "templateId": "<id from catalog>", "reason": "<1-sentence Korean reason>" },
        { "templateId": "<id from catalog>", "reason": "<1-sentence Korean reason>" },
        { "templateId": "<id from catalog>", "reason": "<1-sentence Korean reason>" }
      ]
    }
  ]
}

Rules:
- Output exactly ${scenes.length} entries in "recommendations", one per input scene, preserving input order.
- Exactly 3 candidates per scene, ranked best → worst.
- Every templateId MUST appear in the catalog above. Do not invent IDs.
- Reasons must be in Korean, 1 sentence, concise (≤ 60자 권장).
- ONLY JSON. No backticks. No leading/trailing text.`;
}

function stripCodeFences(text: string): string {
  let t = text.trim();
  // Strip ```json ... ``` or ``` ... ```
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "");
    t = t.replace(/```\s*$/i, "");
  }
  return t.trim();
}

async function runCodex(prompt: string, timeoutMs = 120_000): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "codex-templates-"));
  const lastMsgPath = join(dir, "last.txt");
  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn("codex", [
        "exec",
        "--ephemeral",
        "--skip-git-repo-check",
        "--color", "never",
        "-o", lastMsgPath,
        "-", // read prompt from stdin
      ], { stdio: ["pipe", "pipe", "pipe"] });

      const timer = setTimeout(() => {
        child.kill("SIGKILL");
        reject(new Error(`codex exec timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      let stderr = "";
      child.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
      child.on("error", (err: Error) => { clearTimeout(timer); reject(err); });
      child.on("close", (code: number | null) => {
        clearTimeout(timer);
        if (code === 0) resolve();
        else reject(new Error(`codex exec exited ${code}: ${stderr.slice(-500)}`));
      });

      child.stdin.write(prompt);
      child.stdin.end();
    });

    return await readFile(lastMsgPath, "utf8");
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !Array.isArray((body as { scenes?: unknown }).scenes)
  ) {
    return NextResponse.json(
      { error: "Request body must be { scenes: [...] }." },
      { status: 400 },
    );
  }

  const rawScenes = (body as { scenes: unknown[] }).scenes;
  const scenes: SceneInput[] = [];
  for (const s of rawScenes) {
    if (!s || typeof s !== "object") continue;
    const sObj = s as Record<string, unknown>;
    if (
      typeof sObj.id !== "string" ||
      typeof sObj.title !== "string" ||
      typeof sObj.narration !== "string"
    ) {
      continue;
    }
    scenes.push({
      id: sObj.id,
      title: sObj.title,
      narration: sObj.narration,
      current:
        typeof sObj.current === "string" &&
        KNOWN_TEMPLATE_IDS.has(sObj.current as TemplateId)
          ? (sObj.current as TemplateId)
          : undefined,
    });
  }

  if (scenes.length === 0) {
    return NextResponse.json(
      { error: "No valid scenes provided." },
      { status: 400 },
    );
  }

  const prompt = buildPrompt(scenes);

  // Call codex CLI subprocess
  let rawText: string;
  try {
    rawText = await runCodex(prompt);
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

  // Validate shape & filter unknown templateIds
  const recsIn = (parsed as { recommendations?: unknown }).recommendations;
  if (!Array.isArray(recsIn)) {
    return NextResponse.json(
      {
        error: `Model response missing "recommendations" array. Raw: ${cleaned.slice(
          0,
          300,
        )}`,
      },
      { status: 500 },
    );
  }

  const recommendations: Recommendation[] = [];
  for (const r of recsIn) {
    if (!r || typeof r !== "object") continue;
    const rObj = r as Record<string, unknown>;
    const sceneId = rObj.sceneId;
    const candsIn = rObj.candidates;
    if (typeof sceneId !== "string" || !Array.isArray(candsIn)) continue;

    const candidates: Candidate[] = [];
    for (const c of candsIn) {
      if (!c || typeof c !== "object") continue;
      const cObj = c as Record<string, unknown>;
      const tid = cObj.templateId;
      const reason = cObj.reason;
      if (
        typeof tid === "string" &&
        typeof reason === "string" &&
        KNOWN_TEMPLATE_IDS.has(tid as TemplateId)
      ) {
        candidates.push({ templateId: tid as TemplateId, reason });
      }
      if (candidates.length >= 3) break;
    }

    if (candidates.length > 0) {
      recommendations.push({ sceneId, candidates });
    }
  }

  return NextResponse.json({ recommendations });
}
