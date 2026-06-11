#!/usr/bin/env python3
"""Validate a generated full Puyuma vocabulary/audio corpus file.

Use after running:
  python3 scripts/build_full_puyuma_web_vocabulary.py --download --min-entries 1000
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_DIALECTS = {"38", "39", "40", "41"}


def fail(msg: str) -> None:
    print(f"full corpus output validation failed: {msg}", file=sys.stderr)
    raise SystemExit(1)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("corpus", nargs="?", type=Path, default=ROOT / "data/web/puyuma_vocabulary_audio_entries.json")
    parser.add_argument("--min-entries", type=int, default=1)
    parser.add_argument("--require-all-dialects", action="store_true")
    parser.add_argument("--require-source-phon", action="store_true", help="Require at least one XML-derived source PHON/IPA value.")
    args = parser.parse_args()

    if not args.corpus.exists():
        fail(f"missing file: {args.corpus}")
    data = json.loads(args.corpus.read_text(encoding="utf-8"))
    entries = data.get("entries", [])
    if len(entries) < args.min_entries:
        fail(f"entry count {len(entries)} below required {args.min_entries}")

    ids: set[str] = set()
    dialects: Counter[str] = Counter()
    formats: Counter[str] = Counter()
    source_phon = 0
    for idx, e in enumerate(entries, 1):
        eid = e.get("id")
        if not eid:
            fail(f"entry #{idx} missing id")
        if eid in ids:
            fail(f"duplicate id: {eid}")
        ids.add(eid)
        text = e.get("text", {})
        if not text.get("puyuma_form"):
            fail(f"{eid} missing puyuma_form")
        if not text.get("zh_tw") and not text.get("en"):
            fail(f"{eid} missing both zh_tw and en")
        audio = e.get("audio", {})
        if not str(audio.get("url", "")).startswith("http"):
            fail(f"{eid} missing remote audio URL")
        g2p = e.get("g2p", {})
        if not g2p.get("phoneme_sequence"):
            fail(f"{eid} missing g2p phoneme_sequence")
        ipa = e.get("ipa", {})
        if not ipa.get("value"):
            fail(f"{eid} missing ipa value")
        if ipa.get("source_phon"):
            source_phon += 1
        tts = e.get("tts", {})
        if tts.get("enabled_for_public_ui") is not False:
            fail(f"{eid} TTS must not be public-enabled")
        source = e.get("source", {})
        if source.get("repository") != "FormosanBank/FormosanBank":
            fail(f"{eid} source repository mismatch")
        dialect_code = str(e.get("language", {}).get("dialect_code", ""))
        dialects[dialect_code] += 1
        formats[str(source.get("source_format", ""))] += 1

    if args.require_all_dialects and not REQUIRED_DIALECTS.issubset(set(dialects)):
        fail(f"missing dialects: {sorted(REQUIRED_DIALECTS - set(dialects))}")
    if args.require_source_phon and source_phon == 0:
        fail("no entries contain source_phon")

    print(
        "full corpus output OK: "
        f"{len(entries)} entries; dialects={dict(sorted(dialects.items()))}; "
        f"formats={dict(sorted(formats.items()))}; source_phon={source_phon}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
