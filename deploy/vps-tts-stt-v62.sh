#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
echo "== Pinuyumayan TTS/STT Music v62 preflight =="
python3 scripts/validate_tts_stt_music_v61.py
python3 scripts/validate_tts_stt_music_v62.py
python3 scripts/validate_site_operations_delivery_seal_v61.py
python3 scripts/validate_site_operations_delivery_seal_v62.py
python3 scripts/validate_openapi_contract.py
python3 scripts/build_final_ledger_report_v62.py
if [[ "${IMPORT_SQL:-0}" == "1" ]]; then
  if [[ -z "${DATABASE_URL:-}" ]]; then echo "IMPORT_SQL=1 but DATABASE_URL is missing" >&2; exit 1; fi
  echo "Importing v62 migration and seed SQL into MySQL via DATABASE_URL"
  mysql "$DATABASE_URL" < database/migrations/0058_tts_stt_music_v62.sql
  for f in database/seeds/058_*.sql; do mysql "$DATABASE_URL" < "$f"; done
else
  echo "SQL import skipped. Set IMPORT_SQL=1 and DATABASE_URL to apply 0058 migration/seeds."
fi
[[ "${RUN_FINAL_LEDGER_WRITE:-0}" == "1" ]] && python3 scripts/run_final_ledger_write_v62.py || echo "Final ledger write skipped. Set RUN_FINAL_LEDGER_WRITE=1 after real VPS evidence is available."
[[ "${RUN_DATASET_IMMUTABLE_RELEASE:-0}" == "1" ]] && python3 scripts/run_dataset_real_output_v62.py || echo "Dataset immutable release skipped. Set RUN_DATASET_IMMUTABLE_RELEASE=1 after real legal evidence is complete."
[[ "${RUN_SEARCH_WEEKLY_BACKFILL:-0}" == "1" ]] && python3 scripts/run_search_weekly_operations_v62.py || echo "Search weekly backfill skipped. Set RUN_SEARCH_WEEKLY_BACKFILL=1 after weekly metrics are available."
[[ "${RUN_AUTHORITY_PUBLIC_EVIDENCE:-0}" == "1" ]] && python3 scripts/run_authority_public_expansion_v62.py || echo "Authority public evidence skipped. Set RUN_AUTHORITY_PUBLIC_EVIDENCE=1 after rights review."
[[ "${RUN_GOVERNANCE_ALERT_DELIVERY_AUDIT:-0}" == "1" ]] && python3 scripts/run_governance_alert_live_test_v62.py || echo "Governance alert delivery audit skipped. Set RUN_GOVERNANCE_ALERT_DELIVERY_AUDIT=1 to run live delivery checks."
[[ "${RUN_OPS_DELIVERY_SEAL_REPORT:-0}" == "1" ]] && python3 scripts/run_ops_delivery_seal_v62.py || echo "Ops delivery seal report skipped. Set RUN_OPS_DELIVERY_SEAL_REPORT=1 when Email/LINE/admin channels are configured."
echo "v62 preflight OK"
