#!/usr/bin/env python3
from __future__ import annotations
import json, re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def read(p): return (ROOT/p).read_text(encoding='utf-8')

def main() -> int:
    required = [
        'database/migrations/0004_production_ops.sql',
        'deploy/preflight.sh',
        'deploy/run-migrations.sh',
        'deploy/backup-db.sh',
        'deploy/restore-db.sh',
        'deploy/rollback.sh',
        'deploy/docker-compose.prod.yml',
        'deploy/systemd/pinuyumayan-full-corpus-import.service',
        'deploy/systemd/pinuyumayan-full-corpus-import.timer',
        'data/deployment/production_env_matrix_v8.json',
        'data/deployment/production_ops_manifest_v8.json',
        'data/integration/main_site_contract_tests_v8.json',
        'docs/production_operations_runbook.md',
        'docs/security_api_key_rotation.md',
        'docs/full_corpus_import_operations.md',
        'scripts/preflight_deploy.py',
        'scripts/run_migrations.py',
        'scripts/verify_main_site_contract.py',
    ]
    missing = [p for p in required if not (ROOT/p).exists()]
    if missing:
        print('missing files: ' + ', '.join(missing), file=sys.stderr)
        return 2
    sql = read('database/migrations/0004_production_ops.sql')
    for table in ['ops_deploy_locks','ops_migration_runs','ops_job_runs','api_client_key_rotations','api_rate_limit_policies','webhook_delivery_logs','main_site_sync_snapshots']:
        if table not in sql:
            print(f'missing production ops table: {table}', file=sys.stderr)
            return 2
    matrix = json.loads(read('data/deployment/production_env_matrix_v8.json'))
    req_names = {x['name'] for x in matrix['required']}
    if not {'DATABASE_URL','PINUYUMAYAN_MAIN_SITE_API_KEY','PUBLIC_KNOWLEDGE_BASE_URL'} <= req_names:
        print('env matrix missing required production variables', file=sys.stderr)
        return 2
    tests = json.loads(read('data/integration/main_site_contract_tests_v8.json'))['tests']
    if len(tests) < 6:
        print('contract tests too small', file=sys.stderr)
        return 2
    pkg = json.loads(read('backend/package.json'))
    for script in ['deploy:preflight','deploy:migrations','deploy:backup','contract:main-site','validate:production-ops']:
        if script not in pkg.get('scripts', {}):
            print(f'backend package missing script: {script}', file=sys.stderr)
            return 2
    print(f'production ops layer OK: {len(required)} files, {len(tests)} contract tests')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
