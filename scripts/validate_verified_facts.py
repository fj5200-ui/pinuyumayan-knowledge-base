#!/usr/bin/env python3
from __future__ import annotations
import json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'

def load(name: str):
    return json.loads((DATA / name).read_text(encoding='utf-8'))

def main() -> int:
    registry = load('source_registry.json')
    source_ids = {s['id'] for s in registry.get('sources', [])}
    facts = load('verified_pinuyumayan_facts.json').get('facts', [])
    backlog = load('verified_content_backlog.json').get('items', [])
    fact_ids = {f['id'] for f in facts}
    errors = []
    allowed_status = {'verified_public','community_review_required','restricted','disputed_or_uncertain','community_reviewed'}
    allowed_sens = {'low','medium','high'}

    for idx, fact in enumerate(facts, 1):
        fid = fact.get('id')
        if not fid:
            errors.append(f'fact #{idx} missing id')
        if not fact.get('statement_zh'):
            errors.append(f'{fid}: missing statement_zh')
        if fact.get('verification_status') not in allowed_status:
            errors.append(f'{fid}: invalid verification_status')
        if fact.get('sensitivity') not in allowed_sens:
            errors.append(f'{fid}: invalid sensitivity')
        sids = fact.get('source_ids') or []
        if not sids:
            errors.append(f'{fid}: missing source_ids')
        for sid in sids:
            if sid not in source_ids:
                errors.append(f'{fid}: unknown source_id {sid}')
        if fact.get('sensitivity') == 'high' and '教學' in fact.get('statement_zh','') and '不可' not in fact.get('statement_zh','') and '不得' not in fact.get('statement_zh',''):
            errors.append(f'{fid}: high sensitivity statement may be too instructional')

    for item in backlog:
        for fid in item.get('source_fact_ids', []):
            if fid not in fact_ids:
                errors.append(f"backlog {item.get('id')}: unknown fact_id {fid}")
        if item.get('sensitivity') == 'high' and item.get('public_rendering_rule') != 'summary_only':
            errors.append(f"backlog {item.get('id')}: high sensitivity must be summary_only")

    if errors:
        print('verified facts validation FAILED', file=sys.stderr)
        for e in errors:
            print('-', e, file=sys.stderr)
        return 1
    print(f'verified facts OK: {len(facts)} facts, {len(backlog)} backlog items')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
