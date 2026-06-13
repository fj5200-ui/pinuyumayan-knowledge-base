#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[v45] build speech review workflow seed"
python3 scripts/build_speech_review_workflow_seed_v45.py

echo "[v45] build music search quality report and seed"
python3 scripts/build_music_search_quality_v45.py

echo "[v45] run authority source worker dry-run"
python3 scripts/authority_source_fetch_worker_v45.py --dry-run

echo "[v45] build TTS/STT governance report"
python3 scripts/build_tts_stt_governance_report_v45.py

echo "[v45] build site SEO / sitemap artifacts"
python3 scripts/build_site_seo_artifacts_v45.py

echo "[v45] validate package files"
python3 scripts/validate_tts_stt_music_v45.py
python3 scripts/validate_openapi_contract.py

if [[ "${IMPORT_SQL:-0}" == "1" ]]; then
  if [[ -z "${DATABASE_URL:-}" ]]; then
    echo "DATABASE_URL is required when IMPORT_SQL=1" >&2
    exit 1
  fi
  echo "[v45] importing SQL to VPS MySQL"
  python3 scripts/import_generated_sql.py database/migrations/0041_tts_stt_music_v45.sql --database-url "$DATABASE_URL"
  python3 scripts/import_generated_sql.py database/seeds/041_tts_stt_music_v45.sql --database-url "$DATABASE_URL"
  python3 scripts/import_generated_sql.py database/seeds/041_speech_review_workflow_v45.generated.sql --database-url "$DATABASE_URL"
  python3 scripts/import_generated_sql.py database/seeds/041_music_search_quality_v45.generated.sql --database-url "$DATABASE_URL"
  python3 scripts/import_generated_sql.py database/seeds/041_authority_source_worker_v45.generated.sql --database-url "$DATABASE_URL"
  python3 scripts/import_generated_sql.py database/seeds/041_tts_stt_governance_v45.generated.sql --database-url "$DATABASE_URL"
  python3 scripts/import_generated_sql.py database/seeds/041_site_seo_v45.generated.sql --database-url "$DATABASE_URL"
else
  echo "[v45] SQL import skipped. Set IMPORT_SQL=1 DATABASE_URL=... to apply migration and seeds."
fi

echo "[v45] done"
