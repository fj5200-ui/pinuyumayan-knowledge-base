#!/usr/bin/env python3
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def require(path):
    p = ROOT / path
    if not p.exists():
        raise SystemExit(f'missing required file: {path}')
    return p

def main():
    required = [
        'database/migrations/0026_vps_actual_ops_v29.sql',
        'database/seeds/026_vps_actual_ops_v29.sql',
        'backend/src/rest/vpsActualOpsV29Routes.ts',
        'deploy/vps-run-full-corpus-v29.sh',
        'deploy/vps-backup-restore-checksum-v29.sh',
        'scripts/verify_vps_env_v29.py',
        'scripts/build_search_index_population_v29.py',
        'data/database/full_corpus_acceptance_report_v29.preview.json',
        'data/development/next_upgrade_plan_v30.json',
        'docs/vps_actual_ops_v29.md'
    ]
    for r in required:
        require(r)
    server = require('backend/src/server.ts').read_text(encoding='utf-8')
    if 'registerVpsActualOpsV29Routes(app)' not in server:
        raise SystemExit('server.ts does not register v29 routes')
    openapi = json.loads(require('openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
    paths = openapi.get('paths', {})
    expected = ['/api/ops/vps/v29/readiness','/api/internal/vps/v29/full-corpus-run/report','/api/internal/search/v29/populate-db','/api/ops/next-upgrade-plan/v30']
    for p in expected:
        if p not in paths:
            raise SystemExit(f'OpenAPI missing {p}')
    report = json.loads(require('data/database/full_corpus_acceptance_report_v29.preview.json').read_text(encoding='utf-8'))
    if report.get('status') != 'failed' or report.get('total_entries') >= 1000:
        raise SystemExit('v29 preview report must honestly fail below 1000')
    block = require('data/sources/source_candidate_review_v29.json').read_text(encoding='utf-8')
    for term in ['卑南文化遺址','Beinan Site','Peinan Site']:
        if term not in block:
            raise SystemExit(f'missing forbidden term {term}')
    print(f"vps actual ops v29 OK: {len(required)} required files, {len(paths)} OpenAPI paths, preview report status={report['status']}")

if __name__ == '__main__':
    main()
