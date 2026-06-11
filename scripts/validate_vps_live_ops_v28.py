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
        'database/migrations/0025_vps_live_ops_search_fallback_v28.sql',
        'backend/src/rest/vpsLiveOpsV28Routes.ts',
        'backend/src/lib/productionDbFallbackV28.ts',
        'deploy/vps-full-corpus-staging-v28.sh',
        'deploy/vps-restore-drill-v28.sh',
        'scripts/build_vps_full_corpus_acceptance_v28.py',
        'scripts/build_mysql_fulltext_index_v28.py',
        'data/database/full_corpus_acceptance_report_v28.preview.json',
        'data/development/next_upgrade_plan_v29.json',
        'docs/vps_live_ops_v28.md',
    ]
    for r in required:
        require(r)
    server = require('backend/src/server.ts').read_text(encoding='utf-8')
    if 'registerVpsLiveOpsV28Routes(app)' not in server:
        raise SystemExit('server.ts does not register v28 routes')
    openapi = json.loads(require('openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
    paths = openapi.get('paths', {})
    for p in ['/api/ops/data-mode/v28/status','/api/internal/search/v28/rebuild','/api/ops/next-upgrade-plan/v29']:
        if p not in paths:
            raise SystemExit(f'OpenAPI missing {p}')
    report = json.loads(require('data/database/full_corpus_acceptance_report_v28.preview.json').read_text(encoding='utf-8'))
    if report.get('total_entries') >= 1000 or report.get('status') != 'failed':
        raise SystemExit('preview report must honestly fail below 1000')
    blocked = json.loads(require('data/sources/source_candidate_review_ui_v28.json').read_text(encoding='utf-8'))['forbidden_relation_policy']['terms']
    if '卑南文化遺址' not in blocked or 'Beinan Site' not in blocked:
        raise SystemExit('forbidden relation blocklist missing archaeology terms')
    print(f"vps live ops v28 OK: {len(required)} required files, {len(paths)} OpenAPI paths, honest preview report status={report['status']}")

if __name__ == '__main__':
    main()
