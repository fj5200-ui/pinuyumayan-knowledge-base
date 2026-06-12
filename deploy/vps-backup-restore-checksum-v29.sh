#!/usr/bin/env bash
set -euo pipefail

BACKUP=""
DATABASE="${DATABASE_URL:-}"
TARGET_DB="pinuyumayan_kb_restore"
MYSQL="mysql"
REPORT="data/database/vps_backup_restore_checksum_v29.generated.json"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --backup) BACKUP="$2"; shift 2 ;;
    --database) DATABASE="$2"; shift 2 ;;
    --target-db) TARGET_DB="$2"; shift 2 ;;
    --mysql) MYSQL="$2"; shift 2 ;;
    --report) REPORT="$2"; shift 2 ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

if [[ -z "${BACKUP}" ]]; then
  echo "--backup is required" >&2
  exit 1
fi
if [[ "${TARGET_DB}" == "pinuyumayan_kb" ]]; then
  echo "Refusing to restore over production database." >&2
  exit 1
fi

SHA=$(sha256sum "${BACKUP}" | awk '{print $1}')
${MYSQL} -e "CREATE DATABASE IF NOT EXISTS ${TARGET_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if [[ "${BACKUP}" == *.gz ]]; then
  gunzip -c "${BACKUP}" | ${MYSQL} "${TARGET_DB}"
else
  ${MYSQL} "${TARGET_DB}" < "${BACKUP}"
fi
mkdir -p "$(dirname "${REPORT}")"
cat > "${REPORT}" <<JSON
{
  "version": "v29",
  "backup_file": "${BACKUP}",
  "backup_sha256": "${SHA}",
  "target_database": "${TARGET_DB}",
  "status": "restored_needs_checksum_queries",
  "next_step": "Run row count/checksum queries and submit /api/internal/vps-db/v29/backup-restore-checksum"
}
JSON
echo "[v29] Report written: ${REPORT}"
