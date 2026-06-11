#!/usr/bin/env python3
import json, re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def j(rel): return json.loads((ROOT/rel).read_text(encoding='utf-8'))
def assert_file(rel):
    p=ROOT/rel
    assert p.exists(), f'missing {rel}'
    return p

required = [
  'data/sources/true_source_registry_v20.json',
  'data/content/source_grounded_claims_v20_additions.json',
  'data/content/source_grounded_claims_v20_merged.json',
  'data/content/public_source_grounded_cards_v20.json',
  'data/search/public_search_documents_v20.json',
  'data/ai/frontend_source_packets_v20.json',
  'data/ai/no_duplicate_article_memory_v20.json',
  'data/development/next_upgrade_plan_v21.json',
  'docs/true_knowledge_collection_v20.md',
  'docs/frontend_ai_article_no_duplicate_v20.md',
  'docs/next_upgrade_plan_v21.md',
  'database/migrations/0018_true_knowledge_no_duplicate_roadmap_v20.sql',
  'database/seeds/018_true_knowledge_no_duplicate_roadmap_v20.sql',
  'backend/src/modules/trueKnowledge/service.ts',
  'backend/src/rest/trueKnowledgeRoutes.ts',
  'frontend-sdk/pinuyumayanTrueKnowledgeClient.v20.ts',
]
for rel in required: assert_file(rel)

src = j('data/sources/true_source_registry_v20.json')
assert len(src['sources']) >= 2
assert all(s['trust_level'].startswith('official') for s in src['sources'])

add = j('data/content/source_grounded_claims_v20_additions.json')
claims = add['claims']
assert len(claims) >= 50, f'expected >=50 v20 claims, got {len(claims)}'
ids=[c['claim_id'] for c in claims]
fps=[c['canonical_fingerprint'] for c in claims]
assert len(ids)==len(set(ids)), 'duplicate v20 claim_id'
assert len(fps)==len(set(fps)), 'duplicate v20 canonical_fingerprint'
for c in claims:
    assert c['source_ids'], f'missing source_ids {c["claim_id"]}'
    assert c['evidence_locator'].startswith('L'), f'missing line locator {c["claim_id"]}'
    assert c['review_status'] == 'verified_source_public_summary'
    assert c['public_use'] in ['public','public_summary_only']
    if c['sensitivity'] == 'high':
        assert c['public_use'] == 'public_summary_only', f'high sensitivity must be summary only: {c["claim_id"]}'
        assert len(c.get('article_guardrail','')) >= 20

merged = j('data/content/source_grounded_claims_v20_merged.json')
assert merged['counts']['v20_new_claims'] == len(claims)
assert merged['counts']['total_claims'] >= 120
all_fps=[c['canonical_fingerprint'] for c in merged['claims']]
assert len(all_fps)==len(set(all_fps)), 'merged duplicate canonical_fingerprint'

packets = j('data/ai/frontend_source_packets_v20.json')['packets']
assert len(packets) >= 4
for p in packets:
    assert p['claim_ids']
    assert p['forbidden']

memory = j('data/ai/no_duplicate_article_memory_v20.json')
assert memory['frontend_composer_policy']['article_generation_location'] == 'frontend'
assert memory['frontend_composer_policy']['backend_generation_allowed'] is False
assert len(memory['rules']) >= 5

roadmap = j('data/development/next_upgrade_plan_v21.json')
assert len(roadmap['priority_order']) >= 6
assert '前端 AI 仍負責生成；後端不生成文章本文' in roadmap['acceptance_criteria']

openapi = j('openapi/pinuyumayan-main-site-api.openapi.json')
for p in [
 '/api/public/true-knowledge/v20/sources',
 '/api/public/true-knowledge/v20/claims',
 '/api/public/true-knowledge/v20/source-packets',
 '/api/internal/true-knowledge/v20/deduplicate',
 '/api/internal/true-knowledge/v20/ingestion-runs',
 '/api/ops/next-upgrade-plan',
]:
    assert p in openapi['paths'], f'missing OpenAPI path {p}'
print(f'true knowledge roadmap v20 OK: {len(claims)} new claims, {merged["counts"]["total_claims"]} merged claims, {len(openapi["paths"])} OpenAPI paths, next plan included')
