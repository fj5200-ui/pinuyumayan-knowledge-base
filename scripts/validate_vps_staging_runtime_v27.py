#!/usr/bin/env python3
from pathlib import Path
import json, re, sys
root=Path(__file__).resolve().parents[1]
required=[
 'data/deployment/vps_staging_full_corpus_runbook_v27.json',
 'data/database/production_data_mode_policy_v27.json',
 'data/search/search_index_adapter_v27.json',
 'data/admin/admin_ui_integration_v27.json',
 'data/ops/vps_backup_restore_drill_v27.json',
 'data/sources/source_candidate_adapters_v27.json',
 'data/development/next_upgrade_plan_v28.json',
 'database/migrations/0024_vps_full_corpus_search_backup_v27.sql',
 'database/seeds/024_vps_full_corpus_search_backup_v27.sql',
 'backend/src/rest/vpsStagingV27Routes.ts',
 'backend/src/lib/dataModeV27.ts',
 'scripts/build_vps_full_corpus_acceptance_v27.py',
 'deploy/vps-db-restore-drill-v27.sh'
]
missing=[p for p in required if not (root/p).exists()]
if missing:
    raise SystemExit('Missing v27 files: '+', '.join(missing))
openapi=json.loads((root/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
paths=openapi.get('paths',{})
needed=['/api/admin/corpus/v27/acceptance-latest','/api/internal/corpus/v27/acceptance-report','/api/ops/search/v27/index-status','/api/internal/search/v27/rebuild','/api/ops/data-mode/v27/status','/api/ops/next-upgrade-plan/v28']
missing_paths=[p for p in needed if p not in paths]
if missing_paths:
    raise SystemExit('Missing OpenAPI paths: '+', '.join(missing_paths))
sql=(root/'database/migrations/0024_vps_full_corpus_search_backup_v27.sql').read_text(encoding='utf-8')
for table in ['full_corpus_acceptance_metrics_v27','production_data_mode_events_v27','search_index_documents_v27','vps_backup_restore_drills_v27','source_candidate_ingestion_runs_v27']:
    if table not in sql:
        raise SystemExit(f'Missing SQL table {table}')
server=(root/'backend/src/server.ts').read_text(encoding='utf-8')
if 'registerVpsStagingV27Routes(app)' not in server:
    raise SystemExit('server.ts does not register v27 routes')
# Ensure forbidden archaeology terms remain in source adapter blocklist.
adapters=json.loads((root/'data/sources/source_candidate_adapters_v27.json').read_text(encoding='utf-8'))
terms=' '.join(adapters.get('forbidden_relation_blocklist',[]))
if 'Beinan Site' not in terms or '卑南文化遺址' not in terms:
    raise SystemExit('Forbidden Beinan/Peinan relation blocklist missing')
print(f"vps staging runtime v27 OK: {len(required)} files, {len(paths)} OpenAPI paths, full corpus acceptance/report/search/backup plans present")
