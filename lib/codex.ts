import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Run the OpenAI Codex CLI as a subprocess with the given prompt piped via stdin.
 *
 * Uses `codex exec --ephemeral --skip-git-repo-check -o <tmp>` and reads the
 * "last message" file. Caller is responsible for parsing the returned text.
 *
 * Throws on non-zero exit, timeout, or spawn error (e.g. ENOENT when codex
 * is not on PATH — callers can match `err.code === "ENOENT"`).
 */
export async function runCodex(
  prompt: string,
  timeoutMs = 120_000,
): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "codex-"));
  const lastMsgPath = join(dir, "last.txt");
  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(
        "codex",
        [
          "exec",
          "--ephemeral",
          "--skip-git-repo-check",
          "--color",
          "never",
          "-o",
          lastMsgPath,
          "-", // read prompt from stdin
        ],
        { stdio: ["pipe", "pipe", "pipe"] },
      );

      const timer = setTimeout(() => {
        child.kill("SIGKILL");
        reject(new Error(`codex exec timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      let stderr = "";
      child.stderr.on("data", (d: Buffer) => {
        stderr += d.toString();
      });
      child.on("error", (err: Error) => {
        clearTimeout(timer);
        reject(err);
      });
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

/** Strip surrounding ```json ... ``` or ``` ... ``` fences from model output. */
export function stripCodeFences(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "");
    t = t.replace(/```\s*$/i, "");
  }
  return t.trim();
}
