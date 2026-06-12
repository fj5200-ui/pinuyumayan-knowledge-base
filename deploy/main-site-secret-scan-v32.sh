#!/usr/bin/env bash
set -euo pipefail
TARGET="${1:-../main-site}"
python3 scripts/scan_main_site_secrets_v32.py --target "$TARGET" --out data/integration/main_site_secret_scan_v32.generated.json
