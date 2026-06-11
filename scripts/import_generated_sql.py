#!/usr/bin/env python3
from __future__ import annotations

import argparse
import subprocess
from pathlib import Path
from urllib.parse import urlparse, unquote


def parse_database_url(url: str) -> dict[str, str | int]:
    parsed = urlparse(url)
    if parsed.scheme not in {"mysql", "mysql2"}:
        raise SystemExit("DATABASE_URL must be mysql://")
    return {
        "host": parsed.hostname or "localhost",
        "port": parsed.port or 3306,
        "user": unquote(parsed.username or ""),
        "password": unquote(parsed.password or ""),
        "database": parsed.path.lstrip("/"),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("sql_file")
    parser.add_argument("--database-url", required=True)
    args = parser.parse_args()
    sql_path = Path(args.sql_file)
    if not sql_path.exists():
        raise SystemExit(f"missing SQL file: {sql_path}")
    info = parse_database_url(args.database_url)
    cmd = ["mysql", "--protocol=TCP", "-h", str(info["host"]), "-P", str(info["port"]), "-u", str(info["user"])]
    if info.get("password"):
        cmd.append(f"-p{info['password']}")
    cmd.append(str(info["database"]))
    print(f"[sql] importing {sql_path} into {info['database']}@{info['host']}:{info['port']}")
    with sql_path.open("rb") as fh:
        subprocess.run(cmd, stdin=fh, check=True)
    print("[sql] import OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
