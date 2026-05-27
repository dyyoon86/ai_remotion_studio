# transcribe.py — faster-whisper CLI wrapper
#
# Usage:
#   python scripts/transcribe.py <audio_path> [--model MODEL] [--language LANG]
#
# Defaults: model="base", language=None (auto-detect),
#           device="cpu", compute_type="int8", beam_size=5.
#
# Output: single JSON line to stdout:
#   {"language": "...", "duration": 12.34,
#    "segments": [{"start": 0.0, "end": 2.5, "text": "..."}, ...]}
#
# Errors go to stderr with a non-zero exit code. stdout MUST stay clean JSON.

import argparse
import json
import logging
import os
import sys
import warnings

os.environ.setdefault("HF_HUB_DISABLE_PROGRESS_BARS", "1")
warnings.filterwarnings("ignore")
logging.getLogger().setLevel(logging.ERROR)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="faster-whisper CLI wrapper (JSON to stdout).",
    )
    parser.add_argument("audio_path", help="Path to audio file (wav/mp3/...).")
    parser.add_argument(
        "--model",
        default="base",
        help="Whisper model size (default: base).",
    )
    parser.add_argument(
        "--language",
        default=None,
        help="Force language code (e.g. 'ko'); default auto-detect.",
    )
    args = parser.parse_args()

    audio_path = args.audio_path
    if not os.path.isfile(audio_path):
        print(f"Audio file not found: {audio_path}", file=sys.stderr)
        return 2

    try:
        # Imported lazily so --help works even if the package is missing.
        from faster_whisper import WhisperModel
    except Exception as e:  # noqa: BLE001
        print(f"Failed to import faster_whisper: {e}", file=sys.stderr)
        return 3

    try:
        model = WhisperModel(
            args.model,
            device="cpu",
            compute_type="int8",
        )
    except Exception as e:  # noqa: BLE001
        print(f"Failed to load model '{args.model}': {e}", file=sys.stderr)
        return 4

    try:
        segments_iter, info = model.transcribe(
            audio_path,
            beam_size=5,
            language=args.language,
        )
    except Exception as e:  # noqa: BLE001
        print(f"Transcription failed: {e}", file=sys.stderr)
        return 5

    segments_out = []
    try:
        for seg in segments_iter:
            text = (seg.text or "").strip()
            segments_out.append(
                {
                    "start": float(seg.start),
                    "end": float(seg.end),
                    "text": text,
                }
            )
    except Exception as e:  # noqa: BLE001
        print(f"Failed while iterating segments: {e}", file=sys.stderr)
        return 6

    result = {
        "language": getattr(info, "language", None),
        "duration": float(getattr(info, "duration", 0.0) or 0.0),
        "segments": segments_out,
    }

    print(json.dumps(result, ensure_ascii=False), flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
