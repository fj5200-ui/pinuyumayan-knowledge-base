#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
echo "== Pinuyumayan TTS/STT Music v58 preflight =="
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
python3 scripts/validate_site_operations_notifications_v57.py
python3 scripts/validate_site_operations_delivery_v58.py
python3 scripts/validate_openapi_contract.py
python3 scripts/build_release_certificate_seal_report_v58.py
if [[ "${IMPORT_SQL:-0}" == "1" ]]; then
  if [[ -z "${DATABASE_URL:-}" ]]; then echo "IMPORT_SQL=1 but DATABASE_URL is missing" >&2; exit 1; fi
  echo "Importing v58 migration and seed SQL into MySQL via DATABASE_URL"
  mysql "$DATABASE_URL" < database/migrations/0054_tts_stt_music_v58.sql
  for f in database/seeds/054_*.sql; do mysql "$DATABASE_URL" < "$f"; done
else
  echo "SQL import skipped. Set IMPORT_SQL=1 and DATABASE_URL to apply 0054 migration/seeds."
fi
if [[ "${RUN_RELEASE_CERTIFICATE_SEAL:-0}" == "1" ]]; then
  python3 scripts/run_release_certificate_seal_v58.py
else
  echo "Release certificate seal skipped. Set RUN_RELEASE_CERTIFICATE_SEAL=1 after real VPS evidence is available."
fi
if [[ "${RUN_LEGAL_DATASET_V58_EXPORT:-0}" == "1" ]]; then
  python3 scripts/run_legal_dataset_v58_export.py
else
  echo "Legal dataset v58 export skipped. Set RUN_LEGAL_DATASET_V58_EXPORT=1 after real evidence is available."
fi
if [[ "${RUN_SEARCH_FORMAL_CONFIG_DECISION:-0}" == "1" ]]; then
  python3 scripts/run_search_formal_config_v58.py
else
  echo "Search formal config decision skipped. Set RUN_SEARCH_FORMAL_CONFIG_DECISION=1 after live metrics are available."
fi
if [[ "${RUN_GOVERNANCE_RBAC_AUDIT:-0}" == "1" ]]; then
  python3 scripts/run_governance_rbac_audit_v58.py
else
  echo "Governance RBAC audit skipped. Set RUN_GOVERNANCE_RBAC_AUDIT=1 to run permission contract checks."
fi
if [[ "${RUN_OPS_LIVE_DELIVERY:-0}" == "1" ]]; then
  python3 scripts/run_operations_live_delivery_v58.py
else
  echo "Ops live delivery skipped. Set RUN_OPS_LIVE_DELIVERY=1 when Email/LINE/admin channels are configured."
fi
echo "v58 preflight OK"
