#!/usr/bin/env python3
"""Apply database migrations/seeds for Pinuyumayan Backend Database.

This script intentionally uses mysql CLI so it works with local MySQL, TiDB Cloud,
and VPS deployments without adding Python DB dependencies.
"""
from __future__ import annotations

import argparse
import os
import shlex
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parents[1]

PREVIEW_SQL_FILES = [
    "database/migrations/0001_core_schema.sql",
    "database/migrations/0002_indexes_views.sql",
    "database/migrations/0003_main_site_pull_api.sql",
    "database/seeds/001_sources.sql",
    "database/seeds/002_communities.sql",
    "database/seeds/003_verified_facts.sql",
    "database/seeds/004_rituals.sql",
    "database/seeds/005_preview_vocabulary_audio.sql",
    "database/seeds/006_admin_roles_permissions.sql",
    "database/seeds/007_main_site_api_client.sql",
]


def parse_database_url(url: str) -> dict[str, str | int]:
    parsed = urlparse(url)
    if parsed.scheme not in {"mysql", "mysql2"}:
        raise SystemExit(f"DATABASE_URL must start with mysql://, got {parsed.scheme!r}")
    if not parsed.hostname:
        raise SystemExit("DATABASE_URL hostname is missing")
    db = parsed.path.lstrip("/")
    if not db:
        raise SystemExit("DATABASE_URL database name is missing")
    return {
        "host": parsed.hostname,
        "port": parsed.port or 3306,
        "user": unquote(parsed.username or ""),
        "password": unquote(parsed.password or ""),
        "database": db,
    }


def mysql_cmd(info: dict[str, str | int], sql_file: Path) -> list[str]:
    cmd = [
        "mysql",
        "--protocol=TCP",
        "-h", str(info["host"]),
        "-P", str(info["port"]),
        "-u", str(info["user"]),
        str(info["database"]),
    ]
    password = str(info.get("password") or "")
    if password:
        cmd.insert(-1, f"-p{password}")
    return cmd


def run_sql_file(info: dict[str, str | int], rel_path: str, dry_run: bool = False) -> None:
    sql_path = ROOT / rel_path
    if not sql_path.exists():
        raise SystemExit(f"missing SQL file: {rel_path}")
    printable = " ".join(shlex.quote(part) for part in mysql_cmd(info, sql_path)) + f" < {shlex.quote(str(sql_path))}"
    if dry_run:
        print(f"[dry-run] {printable}")
        return
    print(f"[db] applying {rel_path}")
    with sql_path.open("rb") as fh:
        subprocess.run(mysql_cmd(info, sql_path), stdin=fh, check=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["preview"], default="preview")
    parser.add_argument("--database-url", default=os.getenv("DATABASE_URL"))
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not args.database_url:
        raise SystemExit("DATABASE_URL is required")
    info = parse_database_url(args.database_url)
    files = PREVIEW_SQL_FILES
    print(f"[db] mode={args.mode} files={len(files)} database={info['database']} host={info['host']}:{info['port']}")
    for rel in files:
        run_sql_file(info, rel, args.dry_run)
    print("[db] bootstrap OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
