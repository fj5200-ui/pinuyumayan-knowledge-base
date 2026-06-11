#!/usr/bin/env python3
"""Build a lightweight database seed bundle from current JSON assets.
This does not replace the full corpus importer. It packages current preview data for dev bootstrap.
"""
from __future__ import annotations
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'data/database/generated_seed_bundle.json'

def load(rel):
    return json.loads((ROOT/rel).read_text(encoding='utf-8'))

def main():
    vocab = load('data/web/puyuma_vocabulary_audio_entries.json')
    facts = load('data/verified_pinuyumayan_facts.json')
    communities = load('data/pinuyumayan_communities_expanded.json')
    rituals = load('data/pinuyumayan_rituals.json')
    bundle = {
        'version': '3.0.0-dev-seed',
        'generated_at': datetime.now(timezone.utc).isoformat(),
        'warning': 'This is a development seed bundle. It contains preview vocabulary entries only; run the full corpus importer for the 1000+ entry corpus.',
        'counts': {
            'vocabulary_preview_entries': len(vocab.get('entries', [])),
            'facts': len(facts.get('facts', [])),
            'communities': len(communities.get('communities', [])),
            'rituals': len(rituals.get('rituals', [])) if isinstance(rituals, dict) else len(rituals),
        },
        'tables': {
            'kb_facts': facts.get('facts', []),
            'kb_communities': communities.get('communities', []),
            'kb_rituals': rituals.get('rituals', []) if isinstance(rituals, dict) else rituals,
            'puyuma_corpus_entries_preview': vocab.get('entries', []),
        }
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(bundle, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f"wrote seed bundle: {OUT} ({bundle['counts']})")

if __name__ == '__main__':
    main()
