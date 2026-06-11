#!/usr/bin/env python3
from pathlib import Path
import json, re, sys
root = Path(__file__).resolve().parents[1]
required = [
  'database/migrations/0023_vps_db_production_core_v26.sql',
  'database/seeds/023_vps_db_production_core_v26.sql',
  'data/deployment/vps_database_runtime_v26.json',
  'data/security/internal_api_hmac_enforcement_v26.json',
  'data/auth/admin_auth_db_runtime_v26.json',
  'data/admin/article_review_transaction_policy_v26.json',
  'data/development/next_upgrade_plan_v27.json',
  'backend/src/rest/adminAuthDbV26Routes.ts',
  'backend/src/security/internalHmacV26.ts',
  'backend/src/rest/articleReviewDbV26Routes.ts',
  'backend/src/rest/internalSecurityV26Routes.ts',
  'backend/src/rest/vpsDatabaseV26Routes.ts',
  'deploy/vps-db-install-v26.sh',
  'docs/vps_database_deployment_v26.md',
]
missing = [p for p in required if not (root/p).exists()]
if missing:
    raise SystemExit('missing v26 files: ' + ', '.join(missing))
sql = (root/'database/migrations/0023_vps_db_production_core_v26.sql').read_text()
for table in ['internal_api_nonces_v26','internal_hmac_failures_v26','article_review_transactions_v26','vps_database_instances_v26','full_corpus_acceptance_reports_v26']:
    if table not in sql:
        raise SystemExit(f'missing table {table}')
server = (root/'backend/src/server.ts').read_text()
for name in ['registerAdminAuthDbV26Routes','registerInternalSecurityV26Routes','registerArticleReviewDbV26Routes','registerVpsDatabaseV26Routes']:
    if name not in server:
        raise SystemExit(f'server.ts does not register {name}')
openapi = json.loads((root/'openapi/pinuyumayan-main-site-api.openapi.json').read_text())
paths = openapi.get('paths', {})
for path in ['/api/admin/auth/v26/login','/api/internal/security/v26/verify-hmac','/api/admin/articles/v26/review-action','/api/ops/vps-db/v26/status']:
    if path not in paths:
        raise SystemExit(f'OpenAPI missing {path}')
print(f'vps db production core v26 OK: {len(paths)} OpenAPI paths, DB-backed admin auth, HMAC nonce, VPS DB docs')
