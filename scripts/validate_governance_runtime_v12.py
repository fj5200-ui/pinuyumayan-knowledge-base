#!/usr/bin/env python3
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]

REQUIRED = [
    'database/migrations/0008_multisite_delivery_governance.sql',
    'data/integration/multi_site_delivery_contract_v12.json',
    'data/integration/release_channel_matrix_v12.json',
    'data/integration/search_export_contract_v12.json',
    'data/runtime/sla_slo_policy_v12.json',
    'data/runtime/data_lineage_policy_v12.json',
    'data/database/governance_dashboard_widgets_v12.json',
    'data/database/data_retention_policy_v12.json',
    'data/database/tenant_api_client_matrix_v12.json',
    'backend/src/modules/releaseChannels/service.ts',
    'backend/src/modules/releaseChannels/router.ts',
    'backend/src/modules/dataLineage/service.ts',
    'backend/src/rest/releaseRoutes.ts',
    'frontend-sdk/pinuyumayanKnowledgeClient.v12.ts',
    'docs/release_channel_governance_v12.md',
    'docs/multisite_integration_v12.md',
    'docs/data_lineage_and_quality_dashboard_v12.md',
    'tests/v12_contract_examples.http',
]

for rel in REQUIRED:
    path = ROOT / rel
    if not path.exists():
        raise SystemExit(f'missing required v12 file: {rel}')

sql = (ROOT / 'database/migrations/0008_multisite_delivery_governance.sql').read_text(encoding='utf-8')
tables = re.findall(r'CREATE TABLE IF NOT EXISTS\s+([a-zA-Z0-9_]+)', sql)
if len(tables) < 12:
    raise SystemExit(f'expected at least 12 v12 SQL tables, found {len(tables)}: {tables}')

multi = json.loads((ROOT / 'data/integration/multi_site_delivery_contract_v12.json').read_text(encoding='utf-8'))
clients = {c['client_key'] for c in multi.get('clients', [])}
required_clients = {'main_site', 'admin_console', 'mobile_app', 'search_worker'}
if not required_clients.issubset(clients):
    raise SystemExit(f'missing required clients: {required_clients - clients}')

channels = json.loads((ROOT / 'data/integration/release_channel_matrix_v12.json').read_text(encoding='utf-8'))
channel_keys = {c['channel'] for c in channels.get('channels', [])}
required_channels = {'public', 'preview', 'full_corpus_candidate', 'full_corpus_verified', 'internal_review'}
if not required_channels.issubset(channel_keys):
    raise SystemExit(f'missing required release channels: {required_channels - channel_keys}')

openapi = json.loads((ROOT / 'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
paths = set(openapi.get('paths', {}).keys())
required_paths = {
    '/api/public/release-channels',
    '/api/ops/governance-dashboard',
    '/api/public/knowledge/export/search',
    '/api/internal/release/promote',
    '/api/internal/quality/gates/run',
}
if not required_paths.issubset(paths):
    raise SystemExit(f'missing v12 OpenAPI paths: {required_paths - paths}')

vocab_path = ROOT / 'data/web/puyuma_vocabulary_audio_entries.json'
if vocab_path.exists():
    vocab = json.loads(vocab_path.read_text(encoding='utf-8'))
    if isinstance(vocab, dict):
        entries = vocab.get('entries', [])
    else:
        entries = vocab
    if len(entries) != 80:
        raise SystemExit(f'embedded preview vocabulary should remain 80 before full corpus import; found {len(entries)}')

print(f'governance runtime v12 OK: {len(REQUIRED)} files, {len(tables)} SQL tables, {len(openapi.get("paths", {}))} OpenAPI paths')

