#!/usr/bin/env bash
set -Eeuo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
SNAPSHOT="${1:-}"
if [[ -z "$SNAPSHOT" ]]; then
  echo "Usage: ./deploy/rollback.sh <backup.sql.gz>" >&2
  exit 2
fi
python3 scripts/restore_database.py --input "$SNAPSHOT" --confirm
./deploy/healthcheck.sh
