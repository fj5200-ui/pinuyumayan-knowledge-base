#!/usr/bin/env python3
"""Validate database enrichment layer for the Pinuyumayan knowledge package."""
from __future__ import annotations
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    'data/database/pinuyumayan_database_schema.json',
    'data/database/pinuyumayan_mysql_tidb_schema.sql',
    'data/database/data_quality_rules.json',
    'data/database/source_license_registry.json',
    'data/database/vocabulary_deduplication_rules.json',
    'data/database/content_status_workflow.json',
    'data/database/admin_permissions_seed.json',
    'data/database/import_jobs_seed.json',
    'data/database/search_index_config.json',
    'data/database/database_api_contract.json',
    'webapp/drizzle/pinuyumayan_knowledge_database.schema.ts',
]

def load(rel: str):
    return json.loads((ROOT / rel).read_text(encoding='utf-8'))

def fail(msg: str) -> None:
    print(f'database layer validation failed: {msg}', file=sys.stderr)
    sys.exit(1)

def main() -> None:
    for rel in REQUIRED:
        if not (ROOT / rel).exists():
            fail(f'missing {rel}')
    schema = load('data/database/pinuyumayan_database_schema.json')
    table_names = {t['name'] for t in schema.get('tables', [])}
    required_tables = {'kb_sources','kb_facts','kb_communities','kb_rituals','puyuma_corpus_entries','puyuma_audio_assets','puyuma_tts_jobs','kb_review_tasks','kb_import_runs','kb_search_documents'}
    missing = required_tables - table_names
    if missing:
        fail(f'missing tables: {sorted(missing)}')
    rules = load('data/database/data_quality_rules.json').get('rules', [])
    critical = [r for r in rules if r.get('severity') == 'critical']
    if len(critical) < 3:
        fail('expected at least 3 critical data quality rules')
    license_sources = load('data/database/source_license_registry.json').get('sources', [])
    source_ids = {s.get('source_id') for s in license_sources}
    if 'formosanbank_epark' not in source_ids or 'cip_pinuyumayan_official' not in source_ids:
        fail('license registry must include FormosanBank/ePark and CIP official source')
    jobs = load('data/database/import_jobs_seed.json').get('jobs', [])
    if not any(j.get('expected_min_count', 0) >= 1000 for j in jobs):
        fail('full corpus import job must declare expected_min_count >= 1000')
    sql = (ROOT / 'data/database/pinuyuman_mysql_tidb_schema.sql')
    if sql.exists():
        fail('typo path exists: pinuyuman_mysql_tidb_schema.sql')
    sql_text = (ROOT / 'data/database/pinuyumayan_mysql_tidb_schema.sql').read_text(encoding='utf-8')
    for needle in ['CREATE TABLE IF NOT EXISTS kb_sources', 'CREATE TABLE IF NOT EXISTS puyuma_corpus_entries', 'FULLTEXT KEY ft_puyuma_text']:
        if needle not in sql_text:
            fail(f'SQL missing {needle}')
    print(f"database layer OK: {len(table_names)} tables, {len(rules)} quality rules, {len(jobs)} import jobs")

if __name__ == '__main__':
    main()
