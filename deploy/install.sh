#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MODE="${DEPLOY_INSTALL_MODE:-preview}"
RUN_FULL="${RUN_FULL_CORPUS_ON_DEPLOY:-false}"
MIN_ENTRIES="${FULL_CORPUS_MIN_ENTRIES:-1000}"

echo "[deploy] Pinuyumayan Backend Database install"
echo "[deploy] root=$ROOT_DIR"
echo "[deploy] mode=$MODE run_full=$RUN_FULL min_entries=$MIN_ENTRIES"

command -v python3 >/dev/null || { echo "python3 is required" >&2; exit 2; }
command -v npm >/dev/null || { echo "npm is required" >&2; exit 2; }

if [[ ! -f .env && -f .env.example ]]; then
  cp .env.example .env
  echo "[deploy] created .env from .env.example; edit DATABASE_URL and MAIN_SITE_API_KEY before production use"
fi

if [[ ! -f backend/.env && -f backend/.env.example ]]; then
  cp backend/.env.example backend/.env
  echo "[deploy] created backend/.env from backend/.env.example"
fi

cd backend
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi
npm run build
cd "$ROOT_DIR"

python3 scripts/validate_backend_database_project.py
python3 scripts/validate_main_site_api_layer.py
python3 scripts/validate_deployment_install_layer.py

case "$MODE" in
  preview)
    echo "[deploy] preview mode: run database bootstrap manually or set APPLY_DATABASE_BOOTSTRAP=true"
    if [[ "${APPLY_DATABASE_BOOTSTRAP:-false}" == "true" ]]; then
      python3 scripts/deploy_database.py --mode preview
    fi
    ;;
  full-corpus-postdeploy)
    echo "[deploy] full corpus is configured as postdeploy job"
    if [[ "$RUN_FULL" == "true" ]]; then
      FULL_ARGS=(--download --min-entries "$MIN_ENTRIES")
      if [[ "${IMPORT_SQL_AFTER_BUILD:-false}" == "true" ]]; then
        FULL_ARGS+=(--import-sql)
      fi
      python3 scripts/deploy_full_corpus_import.py "${FULL_ARGS[@]}"
    else
      echo "[deploy] skipped full corpus import; run deploy/postdeploy-full-corpus.sh later"
    fi
    ;;
  full-corpus-blocking)
    python3 scripts/deploy_database.py --mode preview
    python3 scripts/deploy_full_corpus_import.py --download --min-entries "$MIN_ENTRIES" --import-sql
    ;;
  *)
    echo "Unknown DEPLOY_INSTALL_MODE=$MODE" >&2
    exit 2
    ;;
esac

echo "[deploy] install OK"
