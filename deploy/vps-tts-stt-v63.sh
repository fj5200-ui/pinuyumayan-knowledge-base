#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
echo "== Pinuyumayan TTS/STT Music v63 preflight =="
python3 scripts/validate_tts_stt_music_v62.py
python3 scripts/validate_tts_stt_music_v63.py
python3 scripts/validate_site_operations_delivery_seal_v62.py
python3 scripts/validate_site_operations_audit_rhythm_v63.py
python3 scripts/validate_openapi_contract.py
python3 scripts/build_final_certificate_report_v63.py
if [[ "${IMPORT_SQL:-0}" == "1" ]]; then
  if [[ -z "${DATABASE_URL:-}" ]]; then echo "IMPORT_SQL=1 but DATABASE_URL is missing" >&2; exit 1; fi
  echo "Importing v63 migration and seed SQL into MySQL via DATABASE_URL"
  mysql "$DATABASE_URL" < database/migrations/0059_tts_stt_music_v63.sql
  for f in database/seeds/059_*.sql; do mysql "$DATABASE_URL" < "$f"; done
else
  echo "SQL import skipped. Set IMPORT_SQL=1 and DATABASE_URL to apply 0059 migration/seeds."
fi
[[ "${RUN_FINAL_CERTIFICATE_LEDGER_WRITE:-0}" == "1" ]] && python3 scripts/run_final_certificate_ledger_write_v63.py || echo "Final certificate ledger write skipped. Set RUN_FINAL_CERTIFICATE_LEDGER_WRITE=1 after real VPS evidence is available."
[[ "${RUN_DATASET_IMMUTABLE_RELEASE:-0}" == "1" ]] && python3 scripts/run_dataset_immutable_release_v63.py || echo "Dataset immutable release skipped. Set RUN_DATASET_IMMUTABLE_RELEASE=1 after real legal evidence is complete."
[[ "${RUN_SEARCH_IMPROVEMENT_LOOP:-0}" == "1" ]] && python3 scripts/run_search_weekly_improvement_loop_v63.py || echo "Search improvement loop skipped. Set RUN_SEARCH_IMPROVEMENT_LOOP=1 after weekly metrics are available."
[[ "${RUN_AUTHORITY_PUBLIC_EVIDENCE:-0}" == "1" ]] && python3 scripts/run_authority_public_evidence_v63.py || echo "Authority public evidence skipped. Set RUN_AUTHORITY_PUBLIC_EVIDENCE=1 after rights review."
[[ "${RUN_GOVERNANCE_DELIVERY_AUDIT:-0}" == "1" ]] && python3 scripts/run_governance_delivery_audit_v63.py || echo "Governance delivery audit skipped. Set RUN_GOVERNANCE_DELIVERY_AUDIT=1 to run live delivery checks."
[[ "${RUN_OPS_AUDIT_RHYTHM:-0}" == "1" ]] && python3 scripts/run_ops_audit_rhythm_v63.py || echo "Ops audit rhythm skipped. Set RUN_OPS_AUDIT_RHYTHM=1 when Email/LINE/admin channels are configured."
echo "v63 preflight OK"
