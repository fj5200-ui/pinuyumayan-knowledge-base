#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[v46] build reviewer queue"
python3 scripts/build_speech_reviewer_queue_v46.py

echo "[v46] build search observability report"
python3 scripts/build_music_search_observability_v46.py

echo "[v46] build authority source governance report"
python3 scripts/build_authority_source_governance_v46.py

echo "[v46] build model registry report"
python3 scripts/build_speech_model_registry_v46.py

echo "[v46] build site experience report"
python3 scripts/build_site_experience_v46.py

echo "[v46] validate v45 backward compatibility and v46 package"
python3 scripts/validate_tts_stt_music_v45.py
python3 scripts/validate_tts_stt_music_v46.py
python3 scripts/validate_openapi_contract.py

if [[ "${IMPORT_SQL:-0}" == "1" ]]; then
  if [[ -z "${DATABASE_URL:-}" ]]; then
    echo "DATABASE_URL is required when IMPORT_SQL=1" >&2
    exit 1
  fi
  echo "[v46] importing SQL to VPS MySQL"
  python3 scripts/import_generated_sql.py database/migrations/0042_tts_stt_music_v46.sql --database-url "$DATABASE_URL"
  python3 scripts/import_generated_sql.py database/seeds/042_speech_reviewer_queue_v46.generated.sql --database-url "$DATABASE_URL"
  python3 scripts/import_generated_sql.py database/seeds/042_music_search_observability_v46.generated.sql --database-url "$DATABASE_URL"
  python3 scripts/import_generated_sql.py database/seeds/042_authority_source_governance_v46.generated.sql --database-url "$DATABASE_URL"
  python3 scripts/import_generated_sql.py database/seeds/042_speech_model_experiment_registry_v46.generated.sql --database-url "$DATABASE_URL"
  python3 scripts/import_generated_sql.py database/seeds/042_site_experience_v46.generated.sql --database-url "$DATABASE_URL"
else
  echo "[v46] SQL import skipped. Set IMPORT_SQL=1 DATABASE_URL=... to apply migration and seeds."
fi

echo "[v46] done"
