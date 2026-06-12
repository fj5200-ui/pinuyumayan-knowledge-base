#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/build_tts_stt_experiment_workspace_v43.py
python3 scripts/build_music_live_db_seed_v43.py
if [[ "${IMPORT_SQL:-0}" == "1" ]]; then
  : "${DATABASE_URL:?DATABASE_URL is required when IMPORT_SQL=1}"
  mysql "$DATABASE_URL" < database/migrations/0039_tts_stt_live_music_v43.sql
  mysql "$DATABASE_URL" < data/search/music_live_db_seed_v43.generated.sql
fi
python3 scripts/validate_tts_stt_live_music_v43.py
