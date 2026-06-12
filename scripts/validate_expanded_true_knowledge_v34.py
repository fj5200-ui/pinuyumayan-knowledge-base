#!/usr/bin/env python3
from __future__ import annotations
import json, re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
required = [
 'data/sources/expanded_source_search_plan_v34.json',
 'data/sources/source_harvest_worker_contract_v34.json',
 'data/search/expanded_search_config_v34.json',
 'data/content/source_grounded_claims_v34_additions.json',
 'data/content/source_grounded_claims_v34_merged.json',
 'data/content/public_source_grounded_cards_v34.json',
 'data/search/public_search_documents_v34.json',
 'data/ai/frontend_source_packets_v34.json',
 'data/security/forbidden_knowledge_relations_v34.json',
 'data/admin/source_candidate_review_queue_v34.json',
 'database/migrations/0030_expanded_true_knowledge_v34.sql',
 'database/seeds/030_expanded_true_knowledge_v34.sql',
 'backend/src/rest/expandedTrueKnowledgeV34Routes.ts',
 'frontend-sdk/pinuyumayanExpandedTrueKnowledgeClient.v34.ts',
 'docs/expanded_true_knowledge_v34.md',
 'data/development/next_upgrade_plan_v35.json',
]
for rel in required:
    if not (ROOT/rel).exists():
        raise SystemExit(f'missing {rel}')
claims = json.loads((ROOT/'data/content/source_grounded_claims_v34_additions.json').read_text(encoding='utf-8'))['claims']
if len(claims) < 40:
    raise SystemExit(f'too few v34 claims: {len(claims)}')
fps = [c['canonical_fingerprint'] for c in claims]
if len(fps) != len(set(fps)):
    raise SystemExit('duplicate v34 claim fingerprints')
for c in claims:
    text=c.get('statement_zh','')
    if any(bad in text for bad in ['卑南文化遺址是卑南族', 'Beinan Site is Pinuyumayan', 'Peinan Site is Pinuyumayan']):
        raise SystemExit('forbidden archaeology relation found in claim text')
    if c.get('public_use') == 'public' and c.get('sensitivity') == 'high':
        raise SystemExit('high sensitivity claim cannot be public')
forbidden = json.loads((ROOT/'data/security/forbidden_knowledge_relations_v34.json').read_text(encoding='utf-8'))
if 'Beinan Site' not in forbidden.get('blocked_terms', []):
    raise SystemExit('missing Beinan Site forbidden term')
packets = json.loads((ROOT/'data/ai/frontend_source_packets_v34.json').read_text(encoding='utf-8'))['packets']
for p in packets:
    if not p.get('blocked_terms') or 'Beinan Site' not in p['blocked_terms']:
        raise SystemExit('source packet missing forbidden blocked terms')
spec = json.loads((ROOT/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
for path in ['/api/ops/source-search/v34/expanded-plan','/api/public/true-knowledge/v34/cards','/api/public/ai-article/v34/source-packets','/api/ops/next-upgrade-plan/v35']:
    if path not in spec.get('paths', {}):
        raise SystemExit(f'missing openapi path {path}')
server = (ROOT/'backend/src/server.ts').read_text(encoding='utf-8')
if 'registerExpandedTrueKnowledgeV34Routes' not in server:
    raise SystemExit('server route registration missing v34')
print('expanded true knowledge v34 OK: %d new claims, %d merged claims, %d OpenAPI paths, v35 plan included' % (len(claims), json.loads((ROOT/'data/content/source_grounded_claims_v34_merged.json').read_text(encoding='utf-8'))['counts']['merged_total'], len(spec.get('paths',{}))))
