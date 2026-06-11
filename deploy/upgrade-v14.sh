#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

python3 scripts/validate_upgrade_optimization_v14.py

if [[ "${APPLY_MIGRATIONS:-false}" == "true" ]]; then
  mysql "$DATABASE_URL" < database/migrations/0011_performance_security_search_v14.sql
fi

echo "v14 upgrade validation complete. Set APPLY_MIGRATIONS=true to apply SQL migration."
