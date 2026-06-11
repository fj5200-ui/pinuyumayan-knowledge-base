#!/usr/bin/env python3
"""Validate Puyuma audio manifest structure and four-dialect constraints."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ALLOWED = {"38", "39", "40", "41"}


def load_entries(path: Path):
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, list):
        return data
    return data.get("entries", [])


def validate(path: Path) -> int:
    entries = load_entries(path)
    errors = []
    if not entries:
        errors.append("manifest has no entries")
    seen = set()
    for idx, item in enumerate(entries, start=1):
        prefix = f"entry {idx}"
        for key in ["id", "dialect_code", "dialect", "dialect_zh", "category", "form", "chinese", "audio_url", "source_path"]:
            if key not in item:
                errors.append(f"{prefix}: missing {key}")
        code = str(item.get("dialect_code", ""))
        if code not in ALLOWED:
            errors.append(f"{prefix}: invalid dialect_code {code}")
        audio = str(item.get("audio_url", ""))
        if not audio.startswith("http"):
            errors.append(f"{prefix}: audio_url must start with http")
        if not item.get("form"):
            errors.append(f"{prefix}: empty form")
        dedupe_key = (code, item.get("form"), audio)
        if dedupe_key in seen:
            errors.append(f"{prefix}: duplicate dialect/form/audio tuple")
        seen.add(dedupe_key)
    if errors:
        for err in errors:
            print(f"ERROR: {err}", file=sys.stderr)
        return 1
    print(f"audio manifest OK: {len(entries)} entries")
    return 0


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / "data" / "generated" / "puyuma_audio_seed.json"
    raise SystemExit(validate(target))
