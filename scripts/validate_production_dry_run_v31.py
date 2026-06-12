#!/usr/bin/env python3
import json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
required=[
 'data/deployment/production_dry_run_checklist_v31.json',
 'data/integration/main_site_migration_acceptance_v31.json',
 'data/security/internal_hmac_route_coverage_v31.json',
 'data/database/full_corpus_report_backfill_v31.json',
 'data/admin/live_dashboard_binding_v31.json',
 'data/search/search_quality_v31.json',
 'data/sources/source_candidate_intake_v31.json',
 'data/development/next_upgrade_plan_v32.json',
 'database/migrations/0028_production_dry_run_v31.sql',
 'backend/src/rest/productionDryRunV31Routes.ts',
 'deploy/production-dry-run-v31.sh',
 'scripts/build_production_dry_run_report_v31.py',
 'webapp/components/ProductionDryRunDashboardV31.tsx',
 'docs/production_dry_run_v31.md'
]
missing=[p for p in required if not (ROOT/p).exists()]
if missing:
    raise SystemExit('missing v31 files: '+', '.join(missing))
openapi=json.loads((ROOT/'openapi/pinuyumayan-main-site-api.openapi.json').read_text())
paths=openapi.get('paths',{})
needed=['/api/ops/dry-run/v31/readiness','/api/ops/security/v31/hmac-route-coverage','/api/ops/next-upgrade-plan/v32']
absent=[p for p in needed if p not in paths]
if absent:
    raise SystemExit('missing v31 OpenAPI paths: '+', '.join(absent))
server=(ROOT/'backend/src/server.ts').read_text()
if 'registerProductionDryRunV31Routes' not in server:
    raise SystemExit('server.ts does not register v31 routes')
checklist=json.loads((ROOT/'data/deployment/production_dry_run_checklist_v31.json').read_text())
check_count=sum(len(p.get('checks',[])) for p in checklist.get('phases',[]))
if check_count < 20:
    raise SystemExit('expected at least 20 dry-run checks')
preview=json.loads((ROOT/'data/deployment/production_dry_run_report_v31.preview.json').read_text())
if preview.get('actual_vps_run') is not False:
    raise SystemExit('preview report must not claim actual VPS run')
print(f'production dry-run v31 OK: {len(required)} files, {len(paths)} OpenAPI paths, {check_count} checks, actual_vps_run=false')
