#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / 'data' / 'database'

def load(name: str):
    with (DB / name).open(encoding='utf-8') as f:
        return json.load(f)

def require(condition: bool, message: str):
    if not condition:
        raise SystemExit(message)

def main() -> None:
    review = load('review_queue_seed.json')
    widgets = load('admin_dashboard_widgets.json')
    monitor = load('import_monitoring_dashboard.json')
    mirror = load('audio_mirror_queue_schema.json')
    versioning = load('data_versioning_policy.json')
    backup = load('backup_restore_plan.json')
    metrics = load('observability_metrics.json')
    tests = load('api_test_cases.json')
    roles = load('role_permission_matrix_expanded.json')
    manifest = load('enrichment_manifest_v4.json')

    require(review.get('total', 0) >= 100, 'review queue should include fact/vocab review tasks')
    require(len(widgets.get('widgets', [])) >= 5, 'dashboard widgets missing')
    require(len(monitor.get('import_stages', [])) >= 7, 'import stages incomplete')
    require('pending_license_review' in mirror.get('states', []), 'audio mirror state missing')
    require('puyuma_corpus_entries' in versioning.get('versioned_entities', []), 'versioning does not cover corpus')
    require(len(backup.get('restore_drills', [])) >= 3, 'restore drills missing')
    require(any(m.get('key') == 'puyuma_full_entry_count' for m in metrics.get('metrics', [])), 'full corpus metric missing')
    require(len(tests.get('test_groups', [])) >= 3, 'api test groups missing')
    require(any(m.get('module') == 'audio_assets' for m in roles.get('modules', [])), 'role matrix missing audio_assets')
    require(len(manifest.get('added_files', [])) >= 15, 'enrichment manifest incomplete')
    sql = (DB / 'pinuyumayan_sql_views_and_indexes.sql').read_text(encoding='utf-8')
    require('v_puyuma_public_audio_entries' in sql, 'SQL public audio view missing')
    print(f"operational database layer OK: {review['total']} review tasks, {len(widgets['widgets'])} widgets, {len(tests['test_groups'])} api test groups")

if __name__ == '__main__':
    main()

