#!/usr/bin/env bash
set -euo pipefail

MIN_ENTRIES="1000"
DATABASE="${DATABASE_URL:-}"
IMPORT_SQL="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --min-entries) MIN_ENTRIES="$2"; shift 2 ;;
    --database) DATABASE="$2"; shift 2 ;;
    --import-sql) IMPORT_SQL="true"; shift ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

echo "[v28] Starting full corpus staging run. min_entries=${MIN_ENTRIES}"
python3 scripts/build_full_puyuma_web_vocabulary.py --download --min-entries "${MIN_ENTRIES}"
python3 scripts/validate_full_puyuma_corpus_output.py data/web/puyuma_vocabulary_audio_entries.json --min-entries "${MIN_ENTRIES}" --require-all-dialects --require-source-phon
python3 scripts/build_puyuma_sql_seed.py
python3 scripts/build_vps_full_corpus_acceptance_v28.py --input data/web/puyuma_vocabulary_audio_entries.json --min-entries "${MIN_ENTRIES}" --out data/database/full_corpus_acceptance_report_v28.generated.json

if [[ "${IMPORT_SQL}" == "true" ]]; then
  if [[ -z "${DATABASE}" ]]; then
    echo "DATABASE_URL is required for --import-sql" >&2
    exit 1
  fi
  mysql "${DATABASE}" < data/web/puyuma_vocabulary_seed.sql
fi

echo "[v28] Completed. Review data/database/full_corpus_acceptance_report_v28.generated.json before promotion."
