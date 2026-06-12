#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
required = [
 'data/sources/expanded_source_search_plan_v33.json',
 'data/search/expanded_search_config_v33.json',
 'data/content/source_grounded_claims_v33_additions.json',
 'data/content/source_grounded_claims_v33_merged.json',
 'data/content/public_source_grounded_cards_v33.json',
 'data/search/public_search_documents_v33.json',
 'data/ai/frontend_source_packets_v33.json',
 'data/security/forbidden_knowledge_relations_v33.json',
 'data/admin/source_candidate_review_queue_v33.json',
 'database/migrations/0029_expanded_source_search_v33.sql',
 'database/seeds/029_expanded_source_search_v33.sql',
 'backend/src/rest/expandedSourceSearchV33Routes.ts',
 'frontend-sdk/pinuyumayanExpandedSearchClient.v33.ts',
 'docs/expanded_source_search_v33.md',
 'data/development/next_upgrade_plan_v34.json',
]
for rel in required:
    if not (ROOT/rel).exists():
        raise SystemExit(f'missing {rel}')
claims = json.loads((ROOT/'data/content/source_grounded_claims_v33_additions.json').read_text(encoding='utf-8'))['claims']
fps = [c['canonical_fingerprint'] for c in claims]
if len(fps) != len(set(fps)):
    raise SystemExit('duplicate v33 claim fingerprints')
for c in claims:
    if any(term in c.get('statement_zh','') for term in ['卑南文化遺址是卑南族', 'Beinan Site is Pinuyumayan']):
        raise SystemExit('forbidden archaeology relation found in claim text')
forbidden = json.loads((ROOT/'data/security/forbidden_knowledge_relations_v33.json').read_text(encoding='utf-8'))
if 'Beinan Site' not in forbidden.get('blocked_terms', []):
    raise SystemExit('missing Beinan Site forbidden term')
spec = json.loads((ROOT/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
for path in ['/api/ops/source-search/v33/expanded-plan','/api/public/true-knowledge/v33/cards','/api/public/ai-article/v33/source-packets','/api/ops/next-upgrade-plan/v34']:
    if path not in spec.get('paths',{}):
        raise SystemExit(f'missing OpenAPI path {path}')
print(f'expanded source search v33 OK: {len(claims)} new claims, {len(spec.get("paths",{}))} OpenAPI paths, forbidden archaeology guardrail present')
