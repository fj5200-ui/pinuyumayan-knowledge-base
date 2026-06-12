#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${PUBLIC_KNOWLEDGE_BASE_URL:-http://localhost:8787}"
echo "[v30] health"; curl -fsS "$BASE_URL/health"; echo
echo "[v30] readiness"; curl -fsS "$BASE_URL/api/ops/cutover/v30/readiness"; echo
echo "[v30] checklist"; curl -fsS "$BASE_URL/api/ops/cutover/v30/checklist" >/tmp/pinuyumayan-cutover-v30.json
echo "saved /tmp/pinuyumayan-cutover-v30.json"
