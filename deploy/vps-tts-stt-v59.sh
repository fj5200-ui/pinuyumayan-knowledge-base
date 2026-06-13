#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
echo "== Pinuyumayan TTS/STT Music v59 preflight =="
python3 scripts/validate_tts_stt_music_v49.py
python3 scripts/validate_tts_stt_music_v50.py
python3 scripts/validate_tts_stt_music_v51.py
python3 scripts/validate_tts_stt_music_v52.py
python3 scripts/validate_tts_stt_music_v53.py
python3 scripts/validate_tts_stt_music_v54.py
python3 scripts/validate_tts_stt_music_v55.py
python3 scripts/validate_tts_stt_music_v56.py
python3 scripts/validate_tts_stt_music_v57.py
python3 scripts/validate_tts_stt_music_v58.py
python3 scripts/validate_tts_stt_music_v59.py
python3 scripts/validate_site_operations_delivery_v58.py
python3 scripts/validate_site_operations_closed_loop_v59.py
python3 scripts/validate_openapi_contract.py
python3 scripts/build_postseal_validation_report_v59.py
if [[ "${IMPORT_SQL:-0}" == "1" ]]; then
  if [[ -z "${DATABASE_URL:-}" ]]; then echo "IMPORT_SQL=1 but DATABASE_URL is missing" >&2; exit 1; fi
  echo "Importing v59 migration and seed SQL into MySQL via DATABASE_URL"
  mysql "$DATABASE_URL" < database/migrations/0055_tts_stt_music_v59.sql
  for f in database/seeds/055_*.sql; do mysql "$DATABASE_URL" < "$f"; done
else
  echo "SQL import skipped. Set IMPORT_SQL=1 and DATABASE_URL to apply 0055 migration/seeds."
fi
[[ "${RUN_POSTSEAL_VALIDATION:-0}" == "1" ]] && python3 scripts/run_postseal_validation_v59.py || echo "Post-seal validation skipped. Set RUN_POSTSEAL_VALIDATION=1 after real VPS evidence is available."
[[ "${RUN_DATASET_V58_FREEZE:-0}" == "1" ]] && python3 scripts/run_dataset_v58_freeze_v59.py || echo "Dataset v58.0 freeze skipped. Set RUN_DATASET_V58_FREEZE=1 after real legal evidence is complete."
[[ "${RUN_SEARCH_PRODUCTION_POLICY:-0}" == "1" ]] && python3 scripts/run_search_production_policy_v59.py || echo "Search production policy skipped. Set RUN_SEARCH_PRODUCTION_POLICY=1 after live metrics are available."
[[ "${RUN_AUTHORITY_PUBLICATION_EXPANSION:-0}" == "1" ]] && python3 scripts/run_authority_publication_expansion_v59.py || echo "Authority publication expansion skipped. Set RUN_AUTHORITY_PUBLICATION_EXPANSION=1 after rights review."
[[ "${RUN_GOVERNANCE_DOWNLOAD_AUDIT:-0}" == "1" ]] && python3 scripts/run_governance_download_audit_v59.py || echo "Governance download audit skipped. Set RUN_GOVERNANCE_DOWNLOAD_AUDIT=1 to run hardening checks."
[[ "${RUN_OPS_NOTIFICATION_CLOSED_LOOP:-0}" == "1" ]] && python3 scripts/run_ops_notification_closed_loop_v59.py || echo "Ops notification closed loop skipped. Set RUN_OPS_NOTIFICATION_CLOSED_LOOP=1 when channels are configured."
echo "v59 preflight OK"
