#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/build_tts_stt_split_v42.py
python3 scripts/build_music_search_index_v42.py
python3 scripts/authority_source_fetch_worker_v42.py --adapter dry_run
python3 scripts/validate_tts_stt_eval_music_search_v42.py
if [[ -n "${DATABASE_URL:-}" && "${IMPORT_SQL:-0}" == "1" ]]; then
  mysql "$DATABASE_URL" < database/migrations/0038_tts_stt_eval_music_search_v42.sql
  mysql "$DATABASE_URL" < database/seeds/038_tts_stt_eval_music_search_v42.sql
  mysql "$DATABASE_URL" < data/search/music_fulltext_seed_v42.generated.sql
fi
