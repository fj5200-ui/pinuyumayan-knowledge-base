#!/usr/bin/env bash
set -euo pipefail

BACKUP=""
TARGET_DB="pinuyumayan_kb_restore"
MYSQL="mysql"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --backup) BACKUP="$2"; shift 2 ;;
    --target-db) TARGET_DB="$2"; shift 2 ;;
    --mysql) MYSQL="$2"; shift 2 ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

if [[ -z "${BACKUP}" ]]; then
  echo "--backup is required" >&2
  exit 1
fi

echo "[v28] Restore drill target: ${TARGET_DB}"
echo "[v28] This script intentionally targets a restore DB, never production."
${MYSQL} -e "CREATE DATABASE IF NOT EXISTS ${TARGET_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if [[ "${BACKUP}" == *.gz ]]; then
  gunzip -c "${BACKUP}" | ${MYSQL} "${TARGET_DB}"
else
  ${MYSQL} "${TARGET_DB}" < "${BACKUP}"
fi
mkdir -p data/database
cat > data/database/vps_restore_drill_report_v28.generated.json <<JSON
{
  "version": "v28",
  "target_database": "${TARGET_DB}",
  "backup": "${BACKUP}",
  "status": "restored_needs_row_count_check",
  "next_step": "Run row-count/checksum queries and submit /api/internal/vps-db/v28/restore-drill-report"
}
JSON
echo "[v28] Restore drill report written."
