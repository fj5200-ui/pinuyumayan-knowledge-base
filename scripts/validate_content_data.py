#!/usr/bin/env python3
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

required = [
    "source_registry.json",
    "pinuyumayan_communities_expanded.json",
    "pinuyumayan_rituals.json",
    "pinuyumayan_social_organization.json",
    "pinuyumayan_content_taxonomy.json",
    "pinuyumayan_content_cards.json",
    "pinuyumayan_knowledge_graph.json",
]
for rel in required:
    path = DATA / rel
    if not path.is_file():
        raise SystemExit(f"MISSING: data/{rel}")

sources = json.loads((DATA / "source_registry.json").read_text(encoding="utf-8"))
source_ids = {s["id"] for s in sources.get("sources", [])}
if "cip_puyuma_profile" not in source_ids:
    raise SystemExit("MISSING: cip_puyuma_profile source")

communities = json.loads((DATA / "pinuyumayan_communities_expanded.json").read_text(encoding="utf-8"))
items = communities.get("communities", [])
if len(items) != 10:
    raise SystemExit(f"FOUND: expected 10 communities, got {len(items)}")
keys = [item.get("key") for item in items]
if len(set(keys)) != 10:
    raise SystemExit("FOUND: duplicate community keys")
for item in items:
    for field in ["name_zh", "romanization", "origin_system", "platform_summary"]:
        if not item.get(field):
            raise SystemExit(f"FOUND: missing {field} in community {item.get('key')}")

rituals = json.loads((DATA / "pinuyumayan_rituals.json").read_text(encoding="utf-8"))
if len(rituals.get("rituals", [])) < 7:
    raise SystemExit("FOUND: expected at least 7 ritual entries")

cards = json.loads((DATA / "pinuyumayan_content_cards.json").read_text(encoding="utf-8"))
if cards.get("total") != len(cards.get("cards", [])):
    raise SystemExit("FOUND: content card total mismatch")
if len(cards.get("cards", [])) < 30:
    raise SystemExit("FOUND: expected at least 30 content cards")
for card in cards.get("cards", []):
    for sid in card.get("source_ids", []):
        if sid not in source_ids:
            raise SystemExit(f"FOUND: unknown source_id {sid} in card {card.get('id')}")

# guardrails
bad_terms = ["文化" + "典藏", "Puyuma" + " Ten Communities"]
for path in [DATA / r for r in required] + [ROOT / "references" / "pinuyumayan_content_expansion.md"]:
    text = path.read_text(encoding="utf-8")
    for bad in bad_terms:
        if bad in text:
            raise SystemExit(f"FOUND: forbidden term {bad} in {path.relative_to(ROOT)}")

print(f"content data OK: {len(items)} communities, {len(rituals.get('rituals', []))} rituals, {len(cards.get('cards', []))} cards")
