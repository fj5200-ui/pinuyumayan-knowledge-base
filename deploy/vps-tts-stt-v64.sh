#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
echo "== Pinuyumayan TTS/STT Music v64 preflight =="
python3 scripts/validate_tts_stt_music_v63.py
python3 scripts/validate_tts_stt_music_v64.py
python3 scripts/validate_site_operations_audit_rhythm_v63.py
python3 scripts/validate_site_operations_audit_rhythm_v64.py
python3 scripts/validate_openapi_contract.py
python3 scripts/build_final_seal_report_v64.py
if [[ "${IMPORT_SQL:-0}" == "1" ]]; then
  if [[ -z "${DATABASE_URL:-}" ]]; then echo "IMPORT_SQL=1 but DATABASE_URL is missing" >&2; exit 1; fi
  echo "Importing v64 migration and seed SQL into MySQL via DATABASE_URL"
  mysql "$DATABASE_URL" < database/migrations/0060_tts_stt_music_v64.sql
  for f in database/seeds/060_*.sql; do mysql "$DATABASE_URL" < "$f"; done
else
  echo "SQL import skipped. Set IMPORT_SQL=1 and DATABASE_URL to apply 0060 migration/seeds."
fi
[[ "${RUN_FINAL_SEAL_LEDGER_WRITE:-0}" == "1" ]] && python3 scripts/run_final_seal_ledger_write_v64.py || echo "Final seal ledger write skipped. Set RUN_FINAL_SEAL_LEDGER_WRITE=1 after real VPS evidence is available."
[[ "${RUN_DATASET_REAL_OUTPUT:-0}" == "1" ]] && python3 scripts/run_dataset_real_output_v64.py || echo "Dataset real output skipped. Set RUN_DATASET_REAL_OUTPUT=1 after real legal evidence is complete."
[[ "${RUN_SEARCH_QUALITY_RHYTHM:-0}" == "1" ]] && python3 scripts/run_search_quality_rhythm_v64.py || echo "Search quality rhythm skipped. Set RUN_SEARCH_QUALITY_RHYTHM=1 after weekly metrics are available."
[[ "${RUN_AUTHORITY_PUBLIC_AUDIT:-0}" == "1" ]] && python3 scripts/run_authority_public_audit_v64.py || echo "Authority public audit skipped. Set RUN_AUTHORITY_PUBLIC_AUDIT=1 after rights review."
[[ "${RUN_GOVERNANCE_DOWNLOAD_AUDIT:-0}" == "1" ]] && python3 scripts/run_governance_download_audit_v64.py || echo "Governance download audit skipped. Set RUN_GOVERNANCE_DOWNLOAD_AUDIT=1 to run live delivery checks."
[[ "${RUN_OPS_AUDIT_RHYTHM:-0}" == "1" ]] && python3 scripts/run_ops_audit_rhythm_v64.py || echo "Ops audit rhythm skipped. Set RUN_OPS_AUDIT_RHYTHM=1 when Email/LINE/admin channels are configured."
echo "v64 preflight OK"
