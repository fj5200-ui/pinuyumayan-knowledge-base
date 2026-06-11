#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
checks = [
    "文化" + "典藏",
    "development" + "_guidelines.md",
    "/home" + "/ubuntu",
    "Puyuma" + " Ten Communities",
    "pinuyumayan" + "-portal",
]
failed = False
required_files = [
    "references/formosanbank_audio_integration.md",
    "data/formosanbank_sources.json",
    "data/audio_manifest_schema.json",
    "data/generated/puyuma_audio_seed.json",
    "scripts/sync_formosanbank_puyuma.py",
    "scripts/build_puyuma_audio_manifest.py",
    "scripts/validate_audio_manifest.py",
    "references/pinuyumayan_content_expansion.md",
    "references/knowledge_base_governance.md",
    "references/public_content_style_guide.md",
    "data/knowledge_base_index.json",
    "data/pinuyumayan_public_glossary.json",
    "data/source_claim_matrix.json",
    "data/fact_conflict_resolution.json",
    "data/pinuyumayan_publication_checklist.json",
    "data/verified_research_backlog.json",
    "scripts/validate_knowledge_base.py",
]
for rel in required_files:
    if not (ROOT / rel).is_file():
        print(f"MISSING: {rel}")
        failed = True
for path in ROOT.rglob("*"):
    if not path.is_file():
        continue
    if "__pycache__" in path.parts:
        continue
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    for bad in checks:
        if bad in text:
            print(f"FOUND: {bad} in {path.relative_to(ROOT)}")
            failed = True
if not failed:
    try:
        import json
        seed = json.loads((ROOT / "data/generated/puyuma_audio_seed.json").read_text(encoding="utf-8"))
        entries = seed.get("entries", [])
        codes = {str(e.get("dialect_code")) for e in entries}
        if not {"38", "39", "40", "41"}.issubset(codes):
            print("FOUND: seed manifest does not cover all four Puyuma dialect codes")
            failed = True
        for e in entries:
            if not str(e.get("audio_url", "")).startswith("http"):
                print(f"FOUND: invalid audio_url in seed entry {e.get('id')}")
                failed = True
    except Exception as exc:
        print(f"FOUND: seed manifest validation error: {exc}")
        failed = True
if failed:
    raise SystemExit(1)
print("validation OK")
