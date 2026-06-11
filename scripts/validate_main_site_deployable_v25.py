#!/usr/bin/env python3
import json, re, sys
from pathlib import Path
root = Path(__file__).resolve().parents[1]
required = [
 'data/integration/main_site_migration_playbook_v25.json',
 'data/integration/main_site_install_manifest_v25.json',
 'data/admin/article_review_api_contract_v25.json',
 'data/security/hmac_internal_api_enforcement_v25.json',
 'data/database/full_corpus_acceptance_report_v25.json',
 'data/seo/article_publish_pipeline_v25.json',
 'data/development/next_upgrade_plan_v26.json',
 'database/migrations/0023_review_hmac_seo_v25.sql',
 'backend/src/rest/articleReviewV25Routes.ts',
 'backend/src/rest/mainSiteMigrationV25Routes.ts',
 'webapp/lib/kbHmacClient.v25.ts',
 'webapp/app/api/ai/compose-v25/route.ts',
 'docs/main_site_migration_v25.md'
]
missing=[p for p in required if not (root/p).exists()]
if missing:
    raise SystemExit('missing v25 files: '+', '.join(missing))
openapi=json.loads((root/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
paths=openapi.get('paths',{})
needed=['/api/public/main-site/v25/install-manifest','/api/ops/main-site/v25/migration-readiness','/api/admin/articles/v25/review-action','/api/internal/security/v25/verify-hmac','/api/internal/articles/v25/publish-seo-check','/api/ops/next-upgrade-plan/v26']
for p in needed:
    if p not in paths:
        raise SystemExit(f'missing OpenAPI path {p}')
forbidden=json.loads((root/'data/seo/article_publish_pipeline_v25.json').read_text(encoding='utf-8'))['forbidden_terms']
if 'Beinan Site' not in forbidden or '卑南文化遺址' not in forbidden:
    raise SystemExit('forbidden relation terms missing')
claims=json.loads((root/'data/content/true_knowledge_candidate_claims_v25.json').read_text(encoding='utf-8'))
fps=[c['canonical_fingerprint'] for c in claims]
if len(fps) != len(set(fps)):
    raise SystemExit('duplicate v25 claim fingerprints')
print(f'main-site deployable v25 OK: {len(claims)} candidate claims, {len(paths)} OpenAPI paths, v26 plan included')
