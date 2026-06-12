#!/usr/bin/env bash
set -euo pipefail
TARGET_VERSION="${1:-v29}"
REASON="${2:-manual rollback requested}"
echo "[v30] rollback plan target=$TARGET_VERSION"
echo "1) stop backend: sudo systemctl stop pinuyumayan-backend"
echo "2) restore previous release artifact or git tag: $TARGET_VERSION"
echo "3) restore DB backup if migration data is incompatible"
echo "4) start backend and run /health + main-site acceptance"
echo "reason=$REASON"
