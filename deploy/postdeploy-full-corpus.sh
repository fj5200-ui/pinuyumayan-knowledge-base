#!/usr/bin/env bash
set -Eeuo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MIN_ENTRIES="${FULL_CORPUS_MIN_ENTRIES:-1000}"
IMPORT_SQL="${IMPORT_SQL_AFTER_BUILD:-false}"
ARGS=(--download --min-entries "$MIN_ENTRIES")
if [[ "$IMPORT_SQL" == "true" ]]; then
  ARGS+=(--import-sql)
fi

python3 scripts/deploy_full_corpus_import.py "${ARGS[@]}"
python3 scripts/audit_puyuma_corpus_sources.py --source-dir external/formosanbank_puyuma || true
python3 scripts/validate_full_corpus_pipeline.py

echo "[postdeploy] full corpus import job finished"
