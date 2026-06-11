#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
REQUIRED_FILES = [
    'data/runtime/application_runtime_v10.json',
    'data/runtime/api_error_contract_v10.json',
    'data/runtime/job_catalog_v10.json',
    'data/runtime/environment_matrix_v10.json',
    'data/runtime/main_site_pull_examples_v10.json',
    'database/migrations/0006_runtime_hardening.sql',
    'backend/src/lib/apiResponse.ts',
    'backend/src/lib/requestId.ts',
    'backend/src/lib/logger.ts',
    'backend/src/security/apiKeyAuth.ts',
    'backend/src/jobs/jobQueue.ts',
    'backend/src/jobs/fullCorpusImportJob.ts',
    'backend/src/rest/readinessRoutes.ts',
    'backend/src/rest/jobsRoutes.ts',
    'backend/src/modules/runtime/router.ts',
    'backend/src/modules/jobs/router.ts',
    'frontend-sdk/pinuyumayanKnowledgeClient.v10.ts',
    'docs/runtime_hardening_v10.md',
    'docs/full_corpus_import_playbook_v10.md',
    'docs/main_site_pull_examples_v10.md',
]
REQUIRED_TABLES = [
    'api_request_logs','api_error_events','runtime_config_flags','job_queue','job_locks','job_attempts',
    'data_quality_findings','corpus_import_batches','corpus_import_records','main_site_contract_results'
]
if __name__ == '__main__':
    missing = [p for p in REQUIRED_FILES if not (ROOT / p).exists()]
    if missing:
        raise SystemExit(f'missing v10 files: {missing}')
    runtime = json.loads((ROOT/'data/runtime/application_runtime_v10.json').read_text(encoding='utf-8'))
    if runtime.get('version') != 'v10':
        raise SystemExit('runtime version must be v10')
    if runtime.get('corpus_scope_contract', {}).get('full_corpus', {}).get('expected_min_entries', 0) < 1000:
        raise SystemExit('full corpus min entries must remain >= 1000')
    sql = (ROOT/'database/migrations/0006_runtime_hardening.sql').read_text(encoding='utf-8')
    missing_tables = [t for t in REQUIRED_TABLES if t not in sql]
    if missing_tables:
        raise SystemExit(f'missing v10 SQL tables: {missing_tables}')
    server = (ROOT/'backend/src/server.ts').read_text(encoding='utf-8')
    for token in ['helmet()', 'requestIdMiddleware', 'registerReadinessRoutes(app)', 'registerJobsRoutes(app)']:
        if token not in server:
            raise SystemExit(f'server missing {token}')
    root = (ROOT/'backend/src/trpc/root.ts').read_text(encoding='utf-8')
    for token in ['runtime: runtimeRouter', 'jobs: jobsRouter']:
        if token not in root:
            raise SystemExit(f'tRPC root missing {token}')
    spec = json.loads((ROOT/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
    for path in ['/ready','/api/ops/readiness','/api/internal/jobs/full-corpus/enqueue']:
        if path not in spec.get('paths', {}):
            raise SystemExit(f'OpenAPI missing {path}')
    pkg = json.loads((ROOT/'backend/package.json').read_text(encoding='utf-8'))
    for script in ['validate:runtime-v10','ops:readiness','job:enqueue-full-corpus']:
        if script not in pkg.get('scripts', {}):
            raise SystemExit(f'package missing script {script}')
    print(f'application runtime v10 OK: {len(REQUIRED_FILES)} files, {len(REQUIRED_TABLES)} SQL tables, {len(spec.get("paths", {}))} OpenAPI paths')
