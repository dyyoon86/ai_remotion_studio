import { spawn } from "node:child_process";
import { existsSync, openSync, closeSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

/**
 * Resolve the codex binary path at module load time.
 *
 * On Windows the npm install ships a .cmd shim AND a vendored Rust .exe.
 * We prefer the .exe directly so stdin/stdout stay UTF-8 and we bypass
 * cmd.exe's codepage quirks (Korean chars come back as mojibake otherwise).
 *
 * Resolution order:
 *   1. CODEX_PATH env var (user override)
 *   2. <node_dir>/node_modules/@openai/codex/node_modules/@openai/codex-win32-<arch>/vendor/<triple>/codex/codex.exe
 *   3. <node_dir>/codex.exe / codex / codex.cmd (POSIX shims, last resort)
 *   4. Literal "codex" (let PATH sort it out)
 */
function resolveCodexPath(): string {
  if (process.env.CODEX_PATH) return process.env.CODEX_PATH;

  const nodeDir = dirname(process.execPath);

  if (process.platform === "win32") {
    const archSlug =
      process.arch === "arm64" ? "arm64" : process.arch === "x64" ? "x64" : null;
    const triple =
      process.arch === "arm64"
        ? "aarch64-pc-windows-msvc"
        : process.arch === "x64"
          ? "x86_64-pc-windows-msvc"
          : null;
    if (archSlug && triple) {
      const exe = join(
        nodeDir,
        "node_modules",
        "@openai",
        "codex",
        "node_modules",
        "@openai",
        `codex-win32-${archSlug}`,
        "vendor",
        triple,
        "codex",
        "codex.exe",
      );
      if (existsSync(exe)) return exe;
    }
  }

  for (const name of ["codex.exe", "codex", "codex.cmd"]) {
    const candidate = join(nodeDir, name);
    if (existsSync(candidate)) return candidate;
  }

  return "codex";
}

export const CODEX_PATH = resolveCodexPath();

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
  const promptPath = join(dir, "prompt.txt");

  // Write prompt to a UTF-8 file and redirect it into codex's stdin via a
  // file descriptor. On Windows, writing strings to a child's stdin pipe
  // re-encodes Korean (and other non-ASCII) chars per the OS codepage; a
  // file fd preserves raw UTF-8 bytes — equivalent to bash `< prompt.txt`.
  await writeFile(promptPath, prompt, { encoding: "utf8" });
  const stdinFd = openSync(promptPath, "r");

  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(
        CODEX_PATH,
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
        {
          stdio: [stdinFd, "pipe", "pipe"],
          // shell:true only as a last resort when we fell back to the
          // .cmd shim path (resolver returns "codex" literal or a .cmd).
          // For direct .exe / posix binary, no shell needed.
          shell:
            process.platform === "win32" &&
            (CODEX_PATH === "codex" || CODEX_PATH.toLowerCase().endsWith(".cmd")),
        },
      );

      const timer = setTimeout(() => {
        child.kill("SIGKILL");
        reject(new Error(`codex exec timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      let stderr = "";
      child.stderr?.on("data", (d: Buffer) => {
        stderr += d.toString();
      });
      child.on("error", (err: NodeJS.ErrnoException) => {
        clearTimeout(timer);
        if (err.code === "ENOENT") {
          const e = new Error(
            `codex CLI not found at resolved path: ${CODEX_PATH}. Set CODEX_PATH env var to the codex binary, or install OpenAI Codex CLI and run \`codex login\`.`,
          ) as NodeJS.ErrnoException;
          e.code = "ENOENT";
          reject(e);
          return;
        }
        reject(err);
      });
      child.on("close", (code: number | null) => {
        clearTimeout(timer);
        if (code === 0) resolve();
        else reject(new Error(`codex exec exited ${code}: ${stderr.slice(-500)}`));
      });
    });

    return await readFile(lastMsgPath, "utf8");
  } finally {
    try { closeSync(stdinFd); } catch { /* ignore */ }
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
