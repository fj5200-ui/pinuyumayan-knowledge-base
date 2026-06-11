#!/usr/bin/env bash
set -euo pipefail
: "${ADMIN_SUPERUSER_EMAIL:?ADMIN_SUPERUSER_EMAIL is required}"
: "${ADMIN_SUPERUSER_PASSWORD:?ADMIN_SUPERUSER_PASSWORD is required}"
: "${ADMIN_SUPERUSER_DISPLAY_NAME:=平台超級管理員}"
python3 scripts/bootstrap_superadmin.py --emit-sql > database/seeds/009_local_superadmin.generated.sql
echo "Generated database/seeds/009_local_superadmin.generated.sql with password_hash only. Review then import it over a secure channel."
