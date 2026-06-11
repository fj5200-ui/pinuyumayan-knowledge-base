#!/usr/bin/env python3
"""Preflight checks for Pinuyumayan Backend Database production deployment."""
from __future__ import annotations
import json, os, shutil, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def load_env_file(path: Path) -> dict[str, str]:
    data: dict[str, str] = {}
    if not path.exists():
        return data
    for raw in path.read_text(encoding='utf-8').splitlines():
        line = raw.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, v = line.split('=', 1)
        data[k.strip()] = v.strip().strip('"').strip("'")
    return data

def env(name: str, merged: dict[str, str]) -> str:
    return os.environ.get(name) or merged.get(name, '')

def main() -> int:
    matrix = json.loads((ROOT/'data/deployment/production_env_matrix_v8.json').read_text(encoding='utf-8'))
    merged = {}
    merged.update(load_env_file(ROOT/'.env'))
    merged.update(load_env_file(ROOT/'backend/.env'))
    errors: list[str] = []
    warnings: list[str] = []

    for item in matrix['required']:
        val = env(item['name'], merged)
        if not val or val.startswith('CHANGE_ME') or 'replace-with' in val:
            errors.append(f"missing or placeholder required env: {item['name']}")

    api_key = env('PINUYUMAYAN_MAIN_SITE_API_KEY', merged)
    if api_key and len(api_key) < 32:
        errors.append('PINUYUMAYAN_MAIN_SITE_API_KEY must be at least 32 characters')

    cors = env('CORS_ORIGIN', merged)
    if cors in ('', '*') and env('NODE_ENV', merged) == 'production':
        warnings.append('CORS_ORIGIN is wildcard/empty in production; set explicit main site origin')

    for cmd in ['python3', 'npm']:
        if not shutil.which(cmd):
            errors.append(f'required command not found: {cmd}')

    required_files = [
        'database/migrations/0001_core_schema.sql',
        'database/migrations/0002_indexes_views.sql',
        'database/migrations/0003_main_site_pull_api.sql',
        'database/migrations/0004_production_ops.sql',
        'backend/package.json',
        'docs/main_site_integration_guide.md',
    ]
    for rel in required_files:
        if not (ROOT/rel).exists():
            errors.append(f'missing required file: {rel}')

    if warnings:
        for w in warnings:
            print(f'[preflight:warning] {w}')
    if errors:
        for e in errors:
            print(f'[preflight:error] {e}', file=sys.stderr)
        return 2
    print('preflight OK')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
