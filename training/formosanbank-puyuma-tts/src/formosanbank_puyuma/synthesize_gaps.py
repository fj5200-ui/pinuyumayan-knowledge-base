from __future__ import annotations

import argparse
import json
from pathlib import Path

from .pipeline import load_jsonl


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Synthesize unresolved Puyuma gap rows with a trained Coqui TTS model")
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--model-path", type=Path, default=None)
    parser.add_argument("--config-path", type=Path, default=None)
    parser.add_argument("--model-name", type=str, default=None)
    parser.add_argument("--speaker-wav", type=Path, default=None)
    parser.add_argument("--speaker-map-json", type=Path, default=None)
    parser.add_argument("--speaker-idx", type=str, default=None)
    parser.add_argument("--language", type=str, default=None)
    parser.add_argument("--limit", type=int, default=None)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        from TTS.api import TTS
    except Exception as exc:  # pragma: no cover
        raise SystemExit("coqui-tts is required. Install with: pip install -e '.[tts]'") from exc

    rows = load_jsonl(args.manifest)
    if args.limit is not None:
        rows = rows[: args.limit]
    if not rows:
        raise SystemExit("Gap manifest is empty")

    args.output_dir.mkdir(parents=True, exist_ok=True)
    speaker_map: dict[str, str] = {}
    if args.speaker_map_json:
        speaker_map = json.loads(args.speaker_map_json.read_text(encoding="utf-8"))
    if args.model_path:
        tts = TTS(model_path=str(args.model_path), config_path=str(args.config_path) if args.config_path else None)
    elif args.model_name:
        tts = TTS(model_name=args.model_name)
    else:
        raise SystemExit("Provide --model-path/--config-path for a trained checkpoint, or --model-name for a pretrained model")
    generated: list[dict[str, object]] = []

    for row in rows:
        text = str(row.get("text", "")).strip()
        entry_id = str(row.get("entry_id", "")).strip()
        dialect = str(row.get("dialect", "")).strip()
        if not text or not entry_id:
            continue
        out_path = args.output_dir / f"{entry_id}.wav"
        speaker_wav = speaker_map.get(dialect) if speaker_map else (str(args.speaker_wav) if args.speaker_wav else None)
        tts.tts_to_file(
            text=text,
            file_path=str(out_path),
            speaker_wav=speaker_wav,
            speaker=args.speaker_idx,
            language=args.language,
        )
        generated.append(
            {
                "entry_id": entry_id,
                "text": text,
                "dialect": dialect,
                "output_path": str(out_path),
                "public_release_allowed": False,
                "native_review_required": True,
            }
        )

    manifest_path = args.output_dir / "generated_manifest.json"
    manifest_path.write_text(json.dumps({"rows": generated}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"generated": len(generated), "manifest_path": str(manifest_path)}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
