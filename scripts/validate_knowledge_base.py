#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'
REF = ROOT / 'references'

def load(rel: str):
    return json.loads((ROOT / rel).read_text(encoding='utf-8'))

def main() -> int:
    errors = []
    required = [
        'data/knowledge_base_index.json',
        'data/pinuyumayan_public_glossary.json',
        'data/source_claim_matrix.json',
        'data/fact_conflict_resolution.json',
        'data/pinuyumayan_publication_checklist.json',
        'data/verified_research_backlog.json',
        'references/knowledge_base_governance.md',
        'references/public_content_style_guide.md',
    ]
    for rel in required:
        if not (ROOT / rel).is_file():
            errors.append(f'MISSING: {rel}')

    registry = load('data/source_registry.json')
    source_ids = {s['id'] for s in registry.get('sources', [])}
    facts = load('data/verified_pinuyumayan_facts.json').get('facts', [])
    fact_ids = {f['id'] for f in facts}

    # glossary source integrity
    glossary = load('data/pinuyumayan_public_glossary.json')
    for term in glossary.get('terms', []):
        if not term.get('key') or not term.get('label_zh'):
            errors.append('glossary term missing key/label_zh')
        for sid in term.get('source_ids', []):
            if sid not in source_ids:
                errors.append(f"glossary {term.get('key')}: unknown source_id {sid}")
        if term.get('sensitivity') not in {'low','medium','high'}:
            errors.append(f"glossary {term.get('key')}: invalid sensitivity")

    # query routes source integrity
    idx = load('data/knowledge_base_index.json')
    for route in idx.get('query_routes', []):
        if not route.get('intent') or not route.get('must_read'):
            errors.append('knowledge_base_index route missing intent/must_read')
        for rel in route.get('must_read', []):
            if rel.endswith('.json') or rel.endswith('.md'):
                if not (ROOT / rel).exists():
                    errors.append(f"route {route.get('intent')}: missing must_read {rel}")
        for sid in route.get('required_source_ids', []):
            if sid not in source_ids:
                errors.append(f"route {route.get('intent')}: unknown required_source_id {sid}")

    # claim matrix source integrity
    matrix = load('data/source_claim_matrix.json')
    claim_ids = set()
    for claim in matrix.get('claims', []):
        cid = claim.get('claim_id')
        if not cid:
            errors.append('claim missing claim_id')
        if cid in claim_ids:
            errors.append(f'duplicate claim_id {cid}')
        claim_ids.add(cid)
        for sid in claim.get('source_ids', []):
            if sid not in source_ids:
                errors.append(f'claim {cid}: unknown source_id {sid}')
        if claim.get('public_level') not in matrix.get('public_level_rules', {}):
            errors.append(f"claim {cid}: unknown public_level {claim.get('public_level')}")

    # conflict rules source integrity
    conflicts = load('data/fact_conflict_resolution.json')
    for rule in conflicts.get('rules', []):
        if rule.get('severity') not in {'P0','P1','P2'}:
            errors.append(f"conflict {rule.get('id')}: invalid severity")
        for sid in rule.get('source_ids', []):
            if sid not in source_ids:
                errors.append(f"conflict {rule.get('id')}: unknown source_id {sid}")

    # forbid finalized content from research backlog
    research = load('data/verified_research_backlog.json')
    for item in research.get('items', []):
        if 'verified' in item.get('id','') and item.get('risk') == 'low':
            errors.append(f"research backlog {item.get('id')}: misleading verified/low risk")
        if not item.get('needed_sources'):
            errors.append(f"research backlog {item.get('id')}: missing needed_sources")

    bad_terms = ['文化' + '典藏', 'Puyuma' + ' Ten Communities']
    allow_files_for_bad = {Path('data/fact_conflict_resolution.json'), Path('references/public_content_style_guide.md')}
    for path in list(DATA.rglob('*.json')) + list(REF.rglob('*.md')) + [ROOT/'SKILL.md', ROOT/'README.md']:
        relp = path.relative_to(ROOT)
        text = path.read_text(encoding='utf-8')
        for bad in bad_terms:
            if bad in text and relp not in allow_files_for_bad:
                errors.append(f'FOUND forbidden or warning term {bad} in {relp}')

    high_facts = [f for f in facts if f.get('sensitivity') == 'high']
    for f in high_facts:
        st = f.get('statement_zh','')
        if any(x in st for x in ['步驟如下','教學如下','請準備','首先','第二步']):
            errors.append(f"high sensitivity fact too instructional: {f.get('id')}")

    if errors:
        print('knowledge base validation FAILED', file=sys.stderr)
        for e in errors:
            print('-', e, file=sys.stderr)
        return 1
    print(f'knowledge base OK: {len(facts)} facts, {len(glossary.get("terms", []))} glossary terms, {len(matrix.get("claims", []))} claims')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
