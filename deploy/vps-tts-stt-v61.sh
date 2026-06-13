#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
echo "== Pinuyumayan TTS/STT Music v61 preflight =="
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
python3 scripts/validate_tts_stt_music_v60.py
python3 scripts/validate_tts_stt_music_v61.py
python3 scripts/validate_site_operations_delivery_v58.py
python3 scripts/validate_site_operations_closed_loop_v59.py
python3 scripts/validate_site_operations_real_delivery_v60.py
python3 scripts/validate_site_operations_delivery_seal_v61.py
python3 scripts/validate_openapi_contract.py
python3 scripts/build_final_ledger_report_v61.py
if [[ "${IMPORT_SQL:-0}" == "1" ]]; then
  if [[ -z "${DATABASE_URL:-}" ]]; then echo "IMPORT_SQL=1 but DATABASE_URL is missing" >&2; exit 1; fi
  echo "Importing v61 migration and seed SQL into MySQL via DATABASE_URL"
  mysql "$DATABASE_URL" < database/migrations/0057_tts_stt_music_v61.sql
  for f in database/seeds/057_*.sql; do mysql "$DATABASE_URL" < "$f"; done
else
  echo "SQL import skipped. Set IMPORT_SQL=1 and DATABASE_URL to apply 0057 migration/seeds."
fi
[[ "${RUN_FINAL_LEDGER_WRITE:-0}" == "1" ]] && python3 scripts/run_final_ledger_write_v61.py || echo "Final ledger write skipped. Set RUN_FINAL_LEDGER_WRITE=1 after real VPS evidence is available."
[[ "${RUN_DATASET_REAL_OUTPUT:-0}" == "1" ]] && python3 scripts/run_dataset_real_output_v61.py || echo "Dataset real output skipped. Set RUN_DATASET_REAL_OUTPUT=1 after real legal evidence is complete."
[[ "${RUN_SEARCH_WEEKLY_OPERATIONS:-0}" == "1" ]] && python3 scripts/run_search_weekly_operations_v61.py || echo "Search weekly operations skipped. Set RUN_SEARCH_WEEKLY_OPERATIONS=1 after weekly metrics are available."
[[ "${RUN_AUTHORITY_PUBLIC_EXPANSION:-0}" == "1" ]] && python3 scripts/run_authority_public_expansion_v61.py || echo "Authority public expansion skipped. Set RUN_AUTHORITY_PUBLIC_EXPANSION=1 after rights review."
[[ "${RUN_GOVERNANCE_ALERT_LIVE_TEST:-0}" == "1" ]] && python3 scripts/run_governance_alert_live_test_v61.py || echo "Governance alert live test skipped. Set RUN_GOVERNANCE_ALERT_LIVE_TEST=1 to run hardening checks."
[[ "${RUN_OPS_DELIVERY_SEAL:-0}" == "1" ]] && python3 scripts/run_ops_delivery_seal_v61.py || echo "Ops delivery seal skipped. Set RUN_OPS_DELIVERY_SEAL=1 when Email/LINE/admin channels are configured."
echo "v61 preflight OK"
