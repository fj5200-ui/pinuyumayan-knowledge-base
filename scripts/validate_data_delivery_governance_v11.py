#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
REQUIRED_FILES = [
    'data/runtime/runtime_governance_v11.json',
    'data/integration/api_versioning_policy_v11.json',
    'data/integration/main_site_sync_replay_policy_v11.json',
    'data/integration/export_bundle_contract_v11.json',
    'data/integration/main_site_sdk_contract_v11.json',
    'data/database/data_quality_report_templates_v11.json',
    'data/runtime/job_retry_policy_v11.json',
    'database/migrations/0007_data_delivery_governance.sql',
    'backend/src/lib/etag.ts',
    'backend/src/security/apiScopes.ts',
    'backend/src/jobs/retryPolicy.ts',
    'backend/src/rest/versionRoutes.ts',
    'backend/src/rest/exportRoutes.ts',
    'backend/src/rest/syncReplayRoutes.ts',
    'backend/src/modules/versioning/router.ts',
    'backend/src/modules/exports/router.ts',
    'backend/src/modules/sync/router.ts',
    'frontend-sdk/pinuyumayanKnowledgeClient.v11.ts',
    'docs/data_delivery_governance_v11.md',
    'docs/main_site_sync_replay_v11.md',
    'docs/export_bundle_v11.md',
]
REQUIRED_TABLES = [
    'api_versions','api_client_scopes','api_client_scope_grants','data_export_jobs','data_export_artifact_files',
    'sync_replay_runs','sync_replay_events','job_dead_letters','data_quality_reports','data_quality_report_items',
    'public_release_channels','knowledge_publish_batches','cache_invalidation_requests'
]
REQUIRED_OPENAPI_PATHS = [
    '/api/public/version','/api/public/knowledge/export/latest','/api/internal/exports/bundle/enqueue','/api/internal/main-site/sync/replay'
]
if __name__ == '__main__':
    missing = [p for p in REQUIRED_FILES if not (ROOT/p).exists()]
    if missing:
        raise SystemExit(f'missing v11 files: {missing}')
    gov = json.loads((ROOT/'data/runtime/runtime_governance_v11.json').read_text(encoding='utf-8'))
    if gov.get('version') != 'v11':
        raise SystemExit('runtime governance version must be v11')
    if gov.get('corpus_scope_contract', {}).get('full_corpus', {}).get('expected_min_entries', 0) < 1000:
        raise SystemExit('full corpus min entries must be >= 1000')
    if gov.get('corpus_scope_contract', {}).get('preview_subset', {}).get('embedded_entries') != 80:
        raise SystemExit('preview subset must remain explicitly 80 entries')
    sql = (ROOT/'database/migrations/0007_data_delivery_governance.sql').read_text(encoding='utf-8')
    missing_tables = [t for t in REQUIRED_TABLES if t not in sql]
    if missing_tables:
        raise SystemExit(f'missing v11 SQL tables: {missing_tables}')
    server = (ROOT/'backend/src/server.ts').read_text(encoding='utf-8')
    for token in ['registerVersionRoutes(app)', 'registerExportRoutes(app)', 'registerSyncReplayRoutes(app)']:
        if token not in server:
            raise SystemExit(f'server missing {token}')
    root = (ROOT/'backend/src/trpc/root.ts').read_text(encoding='utf-8')
    for token in ['versioning: versioningRouter', 'exports: exportsRouter', 'sync: syncRouter']:
        if token not in root:
            raise SystemExit(f'tRPC root missing {token}')
    spec = json.loads((ROOT/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
    for path in REQUIRED_OPENAPI_PATHS:
        if path not in spec.get('paths', {}):
            raise SystemExit(f'OpenAPI missing {path}')
    pkg = json.loads((ROOT/'backend/package.json').read_text(encoding='utf-8'))
    for script in ['validate:data-delivery-v11','ops:api-version','ops:enqueue-export','ops:replay-sync']:
        if script not in pkg.get('scripts', {}):
            raise SystemExit(f'package missing script {script}')
    print(f'data delivery governance v11 OK: {len(REQUIRED_FILES)} files, {len(REQUIRED_TABLES)} SQL tables, {len(REQUIRED_OPENAPI_PATHS)} new OpenAPI paths')
