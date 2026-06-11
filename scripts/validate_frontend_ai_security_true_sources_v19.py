#!/usr/bin/env python3
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def j(rel):
    return json.loads((ROOT/rel).read_text(encoding='utf-8'))

def assert_file(rel):
    p = ROOT/rel
    assert p.exists(), f'missing {rel}'
    return p

required = [
  'data/ai/frontend_ai_article_composer_policy_v19.json',
  'data/ai/frontend_source_packets_v19.json',
  'data/integration/frontend_ai_article_composer_config_v19.json',
  'data/security/knowledge_base_security_hardening_v19.json',
  'data/content/source_grounded_claims_v19_additions.json',
  'data/content/source_grounded_claims_v19_merged.json',
  'data/content/public_source_grounded_cards_v19.json',
  'data/search/public_search_documents_v19.json',
  'database/migrations/0017_frontend_ai_security_true_sources_v19.sql',
  'database/seeds/017_frontend_ai_security_true_sources_v19.sql',
  'frontend-sdk/pinuyumayanFrontendAiArticleClient.v19.ts',
  'backend/src/modules/frontendAiArticle/service.ts',
  'backend/src/rest/frontendAiArticleRoutes.ts',
]
for rel in required:
    assert_file(rel)

policy = j('data/ai/frontend_ai_article_composer_policy_v19.json')
assert policy['architecture']['deprecated_backend_endpoint'] == '/api/internal/ai-article/draft-plan'
assert policy['prompt_rules']['forbid_unsourced_historical_claims'] is True
assert policy['auto_publish_allowed'] is False

claims = j('data/content/source_grounded_claims_v19_additions.json')['claims']
assert len(claims) >= 40, f'expected at least 40 new claims, got {len(claims)}'
fps = [c['canonical_fingerprint'] for c in claims]
assert len(fps) == len(set(fps)), 'duplicate canonical_fingerprint in v19 additions'
for c in claims:
    assert c['source_ids'], f'missing source_ids {c.get("claim_id")}'
    assert c['evidence_locator'].startswith('L'), f'missing evidence locator {c.get("claim_id")}'
    assert c['review_status'].startswith('verified'), f'not verified summary {c.get("claim_id")}'

merged = j('data/content/source_grounded_claims_v19_merged.json')
assert merged['counts']['v19_new_claims'] == len(claims)
assert merged['counts']['total_claims'] >= 67

openapi = j('openapi/pinuyumayan-main-site-api.openapi.json')
for p in [
  '/api/public/ai-article/frontend-composer-config',
  '/api/internal/ai-article/source-pack/resolve',
  '/api/internal/ai-article/client-draft/validate',
  '/api/internal/ai-article/client-draft/submit-review',
  '/api/ops/security/knowledge-vault',
  '/api/admin/source-claims/v19',
]:
    assert p in openapi['paths'], f'missing OpenAPI path {p}'
assert openapi['paths']['/api/internal/ai-article/draft-plan']['post'].get('deprecated') is True
print(f'frontend AI + security + true sources v19 OK: {len(claims)} new claims, {merged["counts"]["total_claims"]} merged claims, {len(openapi["paths"])} OpenAPI paths')
