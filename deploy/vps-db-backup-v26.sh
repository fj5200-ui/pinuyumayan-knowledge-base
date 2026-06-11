#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL is required}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/pinuyumayan-kb-$STAMP.sql.gz"

echo "Creating logical backup: $OUT"
# Prefer mysqldump with explicit env in production. DATABASE_URL parsing is intentionally not done in shell.
echo "Run: mysqldump --single-transaction --routines --triggers <db> | gzip > $OUT"
echo "Then record the backup through /api/internal/vps-db/v26/backup-report"
