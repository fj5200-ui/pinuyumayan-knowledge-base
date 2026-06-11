#!/usr/bin/env bash
set -euo pipefail

BACKUP_FILE=""
TARGET_DB="pinuyumayan_kb_restore_drill"
PRINT_ONLY="false"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --backup) BACKUP_FILE="$2"; shift 2 ;;
    --target) TARGET_DB="$2"; shift 2 ;;
    --print-only) PRINT_ONLY="true"; shift ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

if [[ -z "$BACKUP_FILE" ]]; then
  echo "Usage: $0 --backup /path/backup.sql[.gz] --target pinuyumayan_kb_restore_drill" >&2
  exit 2
fi

cat <<SQL
-- Restore drill target: ${TARGET_DB}
CREATE DATABASE IF NOT EXISTS \`${TARGET_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Then run one of:
-- gunzip -c '${BACKUP_FILE}' | mysql \`${TARGET_DB}\`
-- mysql \`${TARGET_DB}\` < '${BACKUP_FILE}'
-- After restore, record evidence through /api/internal/vps-db/v27/restore-drill-report
SQL

if [[ "$PRINT_ONLY" == "true" ]]; then
  exit 0
fi

echo "This script prints a safe restore drill plan by default. Execute the printed mysql commands manually on VPS staging."
