#!/usr/bin/env bash
set -euo pipefail

MIN_ENTRIES="1000"
DATABASE="${DATABASE_URL:-}"
IMPORT_SQL="false"
MODE="staging"
POST_REPORT_URL=""
HMAC_HEADER_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --min-entries) MIN_ENTRIES="$2"; shift 2 ;;
    --database) DATABASE="$2"; shift 2 ;;
    --import-sql) IMPORT_SQL="true"; shift ;;
    --mode) MODE="$2"; shift 2 ;;
    --post-report-url) POST_REPORT_URL="$2"; shift 2 ;;
    --hmac-header-file) HMAC_HEADER_FILE="$2"; shift 2 ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

if [[ "${MODE}" == "production" ]]; then
  echo "Refusing first full-corpus import directly in production. Use staging first." >&2
  exit 1
fi

python3 scripts/verify_vps_env_v29.py --database "${DATABASE}" --mode "${MODE}"
mkdir -p data/database data/web

RUN_KEY="full-corpus-v29-$(date -u +%Y%m%dT%H%M%SZ)"
echo "[v29] run_key=${RUN_KEY}"

python3 scripts/build_full_puyuma_web_vocabulary.py --download --min-entries "${MIN_ENTRIES}"
python3 scripts/validate_full_puyuma_corpus_output.py data/web/puyuma_vocabulary_audio_entries.json --min-entries "${MIN_ENTRIES}" --require-all-dialects --require-source-phon
python3 scripts/build_puyuma_sql_seed.py
python3 scripts/build_vps_full_corpus_acceptance_v28.py --input data/web/puyuma_vocabulary_audio_entries.json --min-entries "${MIN_ENTRIES}" --out data/database/full_corpus_acceptance_report_v29.generated.json

if [[ "${IMPORT_SQL}" == "true" ]]; then
  if [[ -z "${DATABASE}" ]]; then
    echo "DATABASE_URL is required for --import-sql" >&2
    exit 1
  fi
  mysql "${DATABASE}" < data/web/puyuma_vocabulary_seed.sql
fi

if [[ -n "${POST_REPORT_URL}" ]]; then
  echo "[v29] Posting acceptance report to ${POST_REPORT_URL}"
  if [[ -n "${HMAC_HEADER_FILE}" ]]; then
    curl -fsS -X POST "${POST_REPORT_URL}" -H "content-type: application/json" $(cat "${HMAC_HEADER_FILE}") --data-binary @data/database/full_corpus_acceptance_report_v29.generated.json
  else
    curl -fsS -X POST "${POST_REPORT_URL}" -H "content-type: application/json" --data-binary @data/database/full_corpus_acceptance_report_v29.generated.json
  fi
fi

echo "[v29] Completed. Review data/database/full_corpus_acceptance_report_v29.generated.json"
