#!/usr/bin/env python3
import json, pathlib, sys, re
root=pathlib.Path(__file__).resolve().parents[1]
required=[
 'data/deployment/vps_dry_run_backfill_v32.json',
 'data/integration/main_site_migration_secret_scan_v32.json',
 'data/security/internal_hmac_enforcement_v32.json',
 'data/database/full_corpus_backfill_contract_v32.json',
 'data/admin/live_dashboard_api_bindings_v32.json',
 'data/search/search_seo_validation_v32.json',
 'data/deployment/production_static_fallback_enforcement_v32.json',
 'data/development/next_upgrade_plan_v33.json',
 'database/migrations/0029_vps_dry_run_backfill_hmac_v32.sql',
 'backend/src/security/enforceInternalHmacV32.ts',
 'backend/src/rest/vpsDryRunBackfillV32Routes.ts',
 'deploy/vps-dry-run-backfill-v32.sh',
 'deploy/main-site-secret-scan-v32.sh',
 'scripts/backfill_vps_dry_run_report_v32.py',
 'scripts/scan_main_site_secrets_v32.py',
 'docs/vps_dry_run_backfill_v32.md'
]
missing=[p for p in required if not (root/p).exists()]
if missing:
 print('missing v32 files:',missing); sys.exit(1)
openapi=json.loads((root/'openapi/pinuyumayan-main-site-api.openapi.json').read_text())
paths=openapi.get('paths',{})
needed=['/api/ops/vps/v32/dry-run-backfill-plan','/api/internal/vps/v32/dry-run-backfill-report','/api/ops/security/v32/hmac-enforcement','/api/ops/next-upgrade-plan/v33']
miss=[p for p in needed if p not in paths]
if miss:
 print('missing v32 openapi paths:',miss); sys.exit(1)
server=(root/'backend/src/server.ts').read_text()
if 'registerVpsDryRunBackfillV32Routes(app)' not in server or 'enforceInternalHmacV32' not in server:
 print('server.ts missing v32 registration or hmac middleware'); sys.exit(1)
forbidden=json.loads((root/'data/search/search_seo_validation_v32.json').read_text())['forbidden_search_relations']
if 'Beinan Site' not in forbidden or '卑南文化遺址' not in forbidden:
 print('forbidden relation guardrail missing'); sys.exit(1)
print(f"vps dry-run backfill v32 OK: {len(required)} files, {len(paths)} OpenAPI paths, HMAC enforcement middleware registered")
