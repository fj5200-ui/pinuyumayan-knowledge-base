#!/usr/bin/env python3
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def require(path):
    p = ROOT / path
    if not p.exists():
        raise SystemExit(f"missing required file: {path}")
    return p

required = [
  'data/integration/main_site_runtime_bridge_v24.json',
  'data/integration/main_site_required_settings_v24.json',
  'data/ai/server_side_ai_route_contract_v24.json',
  'data/security/internal_api_hmac_enforcement_matrix_v24.json',
  'data/admin/article_review_workbench_v24.json',
  'data/database/full_corpus_acceptance_v24.json',
  'data/seo/article_publish_seo_policy_v24.json',
  'data/sources/source_candidate_harvest_v24.json',
  'data/content/true_knowledge_candidate_claims_v24.json',
  'data/development/next_upgrade_plan_v25.json',
  'database/migrations/0022_main_site_runtime_bridge_v24.sql',
  'database/seeds/022_main_site_runtime_bridge_v24.sql',
  'backend/src/security/requireHmacV24.ts',
  'backend/src/modules/mainSiteRuntimeV24/service.ts',
  'backend/src/rest/mainSiteRuntimeBridgeV24Routes.ts',
  'webapp/lib/kbHmacClient.v24.ts',
  'webapp/app/api/ai/compose-v24/route.ts',
  'webapp/app/api/kb/connection-check/route.ts',
  'webapp/app/api/articles/schedule/route.ts',
  'webapp/components/ArticleComposerV24.tsx',
  'webapp/components/AdminArticleReviewWorkbenchV24.tsx',
  'frontend-sdk/mainSiteRuntimeBridge.v24.ts',
  'docs/main_site_runtime_bridge_v24.md',
  'docs/hmac_internal_api_enforcement_v24.md',
  'docs/full_corpus_acceptance_v24.md',
  'docs/next_upgrade_plan_v25.md',
  'deploy/check-main-site-v24.sh'
]
for r in required:
    require(r)

bridge = json.loads(require('data/integration/main_site_runtime_bridge_v24.json').read_text(encoding='utf-8'))
assert bridge['version'] == 'v24'
assert any('Beinan' in x or '卑南文化遺址' in x for x in bridge['hard_rules'])
assert any(x['from'].endswith('kbHmacClient.v24.ts') for x in bridge['copy_to_main_site'])

hmac = json.loads(require('data/security/internal_api_hmac_enforcement_matrix_v24.json').read_text(encoding='utf-8'))
assert hmac['enforcement_mode'] == 'required_in_production'
assert len(hmac['routes']) >= 6

claims = json.loads(require('data/content/true_knowledge_candidate_claims_v24.json').read_text(encoding='utf-8'))
assert len(claims) >= 8
fingerprints = [c['canonical_fingerprint'] for c in claims]
assert len(fingerprints) == len(set(fingerprints))
assert all(c['review_status'] == 'candidate_needs_human_review' for c in claims)

sql = require('database/migrations/0022_main_site_runtime_bridge_v24.sql').read_text(encoding='utf-8')
for table in ['main_site_ai_compose_sessions_v24','internal_hmac_nonce_failures_v24','article_publish_schedule_v24','source_candidate_claims_v24','full_corpus_acceptance_reports_v24']:
    assert table in sql, table

openapi = json.loads(require('openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
for path in ['/api/ops/main-site/v24/connection-check','/api/internal/ai-article/v24/client-draft/validate','/api/ops/next-upgrade-plan/v25']:
    assert path in openapi.get('paths', {}), f"openapi missing {path}"

print(f"main site runtime bridge v24 OK: {len(claims)} candidate claims, {len(openapi.get('paths',{}))} OpenAPI paths, v25 plan included")
