#!/usr/bin/env bash
set -euo pipefail

DB_NAME="${PINUYUMAYAN_DB_NAME:-pinuyumayan_kb}"
DB_USER="${PINUYUMAYAN_DB_USER:-pinuyumayan}"
DB_HOST_BIND="${PINUYUMAYAN_DB_BIND:-127.0.0.1}"

if [[ "${1:-}" == "--print-only" ]]; then
  cat <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '<CHANGE_ME_STRONG_PASSWORD>';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES, LOCK TABLES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL
  exit 0
fi

cat <<'MSG'
This script prepares the VPS database runtime checklist.
Run with --print-only to print SQL, then execute it inside mysql as root.
Never expose port 3306 publicly. Use localhost, private LAN, firewall allowlist, or VPN.
MSG

echo "DB_NAME=${DB_NAME}"
echo "DB_USER=${DB_USER}"
echo "DB_HOST_BIND=${DB_HOST_BIND}"
echo "Next: ./deploy/vps-db-install-v26.sh --print-only"
