#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_AUDIO_ROOT = ROOT / "training" / "formosanbank-puyuma-tts" / "data" / "raw" / "audio"
DEFAULT_OUT = ROOT / "data" / "audio" / "puyuma_tts_speaker_map_v65.generated.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="Build a dialect-to-speaker-reference wav map for Puyuma TTS gap synthesis")
    parser.add_argument("--audio-root", type=Path, default=DEFAULT_AUDIO_ROOT)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()

    dialect_map: dict[str, str] = {}
    for wav in sorted(args.audio_root.rglob("*.wav")):
        parent = wav.parent.name
        if parent.endswith("_Puyuma") and parent not in dialect_map:
            dialect_map[parent] = str(wav)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(dialect_map, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"dialects": len(dialect_map), "out": str(args.out), "map": dialect_map}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
