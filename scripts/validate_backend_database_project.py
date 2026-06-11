#!/usr/bin/env python3
from __future__ import annotations
import json, pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
required = [
  'PROJECT.md', 'PROJECT.manifest.json', 'README.md', 'legacy/SKILL.legacy.md',
  'database/migrations/0001_core_schema.sql', 'database/migrations/0002_indexes_views.sql',
  'database/seeds/001_sources.sql', 'database/seeds/002_communities.sql', 'database/seeds/003_verified_facts.sql',
  'database/seeds/004_rituals.sql', 'database/seeds/005_preview_vocabulary_audio.sql',
  'database/seeds/006_admin_roles_permissions.sql',
  'backend/package.json', 'backend/src/server.ts', 'backend/src/db/schema.ts', 'backend/src/trpc/root.ts',
  'docs/backend_database_architecture.md', 'data/database/backend_database_architecture_v5.json',
  'data/database/backend_api_contract_v5.json'
]
missing = [p for p in required if not (ROOT/p).exists()]
if missing:
    print('missing required files:', missing)
    sys.exit(1)
manifest = json.loads((ROOT/'PROJECT.manifest.json').read_text(encoding='utf-8'))
if manifest.get('status') != 'backend_database_project_not_skill_package':
    print('manifest status not converted')
    sys.exit(1)
sql = (ROOT/'database/migrations/0001_core_schema.sql').read_text(encoding='utf-8')
required_tables = ['kb_sources','kb_facts','pinuyumayan_communities','pinuyumayan_rituals','puyuma_corpus_entries','puyuma_audio_assets','puyuma_ipa_annotations','puyuma_tts_jobs','kb_review_tasks','kb_import_runs','kb_search_documents','ops_audio_mirror_queue','admin_roles']
missing_tables = [t for t in required_tables if f'CREATE TABLE IF NOT EXISTS {t}' not in sql]
if missing_tables:
    print('missing tables:', missing_tables)
    sys.exit(1)
# Ensure preview/full corpus distinction is present
if 'preview_subset' not in sql or 'full_corpus' not in sql:
    print('corpus scope distinction missing')
    sys.exit(1)
# Counts check
facts = json.loads((ROOT/'data/verified_pinuyumayan_facts.json').read_text(encoding='utf-8'))['facts']
vocab = json.loads((ROOT/'data/web/puyuma_vocabulary_audio_entries.json').read_text(encoding='utf-8'))['entries']
if len(facts) < 100 or len(vocab) != 80:
    print(f'unexpected counts: facts={len(facts)} vocab={len(vocab)}')
    sys.exit(1)
# Public safety views
views = (ROOT/'database/migrations/0002_indexes_views.sql').read_text(encoding='utf-8')
for v in ['vw_public_communities','vw_public_facts','vw_public_ritual_summaries','vw_public_puyuma_audio_entries']:
    if v not in views:
        print('missing public view', v)
        sys.exit(1)
print(f'backend database project OK: {len(required_tables)} core tables, {len(facts)} facts, {len(vocab)} preview vocab entries')
