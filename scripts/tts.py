# tts.py — edge-tts CLI wrapper
#
# Usage:
#   python scripts/tts.py <text|@path-to-text-file> <voice> <output_mp3_path>
#
# If the first positional arg starts with "@", the remainder is treated as a
# file path and the text is read from that UTF-8 file. Otherwise the arg is
# treated as the literal text. Using "@file" form avoids argv encoding issues
# on Windows with multi-byte (Korean) text.
#
# On success: a single JSON line is printed to stdout, e.g.
#   {"ok": true, "path": "C:/.../out.mp3"}
# On error: a JSON line is printed to stderr and the process exits non-zero.

import asyncio
import json
import logging
import os
import sys
import warnings

os.environ.setdefault("PYTHONHTTPSVERIFY", "0")
warnings.filterwarnings("ignore")
logging.getLogger().setLevel(logging.ERROR)

# Corporate SSL intercept (self-signed CA). edge-tts hardcodes its own SSL
# context (built from certifi's CA bundle) inside edge_tts.communicate._SSL_CTX
# and passes it explicitly to aiohttp, so PYTHONHTTPSVERIFY/ClientSession patches
# are ignored. Override the module-level constant with an unverified context.
def _disable_edge_tts_ssl_verify() -> None:
    try:
        import ssl as _ssl
        import edge_tts.communicate as _ec  # type: ignore

        ctx = _ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = _ssl.CERT_NONE
        _ec._SSL_CTX = ctx  # type: ignore[attr-defined]

        # drainage submodule (used for stream reading) shares the same constant in some versions
        try:
            import edge_tts.drm as _drm  # type: ignore
            if hasattr(_drm, "_SSL_CTX"):
                _drm._SSL_CTX = ctx  # type: ignore[attr-defined]
        except ImportError:
            pass
    except ImportError:
        pass


_disable_edge_tts_ssl_verify()


async def synth(text: str, voice: str, out: str) -> None:
    # Imported lazily so a missing dep still produces a clean JSON error below.
    import edge_tts  # type: ignore

    comm = edge_tts.Communicate(text, voice)
    await comm.save(out)


def _err(msg: str, code: int = 1) -> int:
    sys.stderr.write(json.dumps({"error": msg}, ensure_ascii=False) + "\n")
    sys.stderr.flush()
    return code


def main() -> int:
    if len(sys.argv) < 4:
        return _err("usage: tts.py <text|@file> <voice> <out>", 2)

    text_arg = sys.argv[1]
    voice = sys.argv[2]
    out = sys.argv[3]

    if text_arg.startswith("@"):
        path = text_arg[1:]
        try:
            with open(path, "r", encoding="utf-8") as f:
                text = f.read()
        except Exception as e:  # noqa: BLE001
            return _err(f"failed to read text file '{path}': {e}", 3)
    else:
        text = text_arg

    text = text.strip()
    if not text:
        return _err("text is empty", 4)
    if not voice:
        return _err("voice is empty", 5)
    if not out:
        return _err("out path is empty", 6)

    try:
        asyncio.run(synth(text, voice, out))
    except Exception as e:  # noqa: BLE001
        return _err(f"edge-tts synthesis failed: {e}", 7)

    sys.stdout.write(
        json.dumps({"ok": True, "path": out}, ensure_ascii=False) + "\n"
    )
    sys.stdout.flush()
    return 0


if __name__ == "__main__":
    sys.exit(main())
