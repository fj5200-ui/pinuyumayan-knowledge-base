#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[v44] validate package files"
python3 scripts/validate_tts_stt_music_v44.py

echo "[v44] build TTS/STT export artifacts"
python3 scripts/export_tts_stt_dataset_v44.py

echo "[v44] build speech authorization SQL seed"
python3 scripts/build_speech_authorization_seed_v44.py

echo "[v44] build music FULLTEXT seed"
python3 scripts/build_music_search_db_seed_v44.py

echo "[v44] build authority source candidate seed"
python3 scripts/authority_source_candidate_worker_v44.py

if [[ "${IMPORT_SQL:-0}" == "1" ]]; then
  if [[ -z "${DATABASE_URL:-}" ]]; then
    echo "DATABASE_URL is required when IMPORT_SQL=1" >&2
    exit 1
  fi
  echo "[v44] importing SQL to VPS MySQL"
  python3 scripts/import_generated_sql.py database/migrations/0040_tts_stt_music_v44.sql --database-url "$DATABASE_URL"
  python3 scripts/import_generated_sql.py database/seeds/040_tts_stt_music_v44.sql --database-url "$DATABASE_URL"
  python3 scripts/import_generated_sql.py database/seeds/040_speech_asset_authorization_v44.generated.sql --database-url "$DATABASE_URL"
  python3 scripts/import_generated_sql.py database/seeds/040_music_search_documents_v44.generated.sql --database-url "$DATABASE_URL"
  python3 scripts/import_generated_sql.py database/seeds/040_authority_source_candidates_v44.generated.sql --database-url "$DATABASE_URL"
else
  echo "[v44] SQL import skipped. Set IMPORT_SQL=1 DATABASE_URL=... to apply migration and seeds."
fi

echo "[v44] done"
