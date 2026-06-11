#!/usr/bin/env python3
"""Post-deploy full corpus import runner.

Builds full FormosanBank/ePark Puyuma corpus, validates it, generates SQL seed,
and optionally imports it into MySQL/TiDB. This must be a post-deploy/background
job, not the web server start command.
"""
from __future__ import annotations

import argparse
import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def run(cmd: list[str]) -> None:
    print("[run]", " ".join(cmd))
    subprocess.run(cmd, cwd=ROOT, check=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--download", action="store_true")
    parser.add_argument("--min-entries", type=int, default=int(os.getenv("FULL_CORPUS_MIN_ENTRIES", "1000")))
    parser.add_argument("--import-sql", action="store_true")
    parser.add_argument("--database-url", default=os.getenv("DATABASE_URL"))
    args = parser.parse_args()

    build_cmd = ["python3", "scripts/build_full_puyuma_web_vocabulary.py", "--min-entries", str(args.min_entries)]
    if args.download:
        build_cmd.append("--download")
    run(build_cmd)

    run([
        "python3", "scripts/validate_full_puyuma_corpus_output.py",
        "data/web/puyuma_vocabulary_audio_entries.json",
        "--min-entries", str(args.min_entries),
        "--require-all-dialects",
        "--require-source-phon",
    ])

    run(["python3", "scripts/build_puyuma_sql_seed.py"])
    run(["python3", "scripts/validate_web_vocabulary.py"])
    run(["python3", "scripts/validate_tts_g2p_ipa.py"])

    if args.import_sql:
        if not args.database_url:
            raise SystemExit("--import-sql requires DATABASE_URL")
        sql_path = ROOT / "data/web/puyuma_vocabulary_seed.sql"
        if not sql_path.exists():
            raise SystemExit(f"missing SQL seed: {sql_path}")
        # Import the generated corpus SQL. Keep this separate from preview bootstrap.
        run(["python3", "scripts/import_generated_sql.py", str(sql_path), "--database-url", args.database_url])

    print("[full-corpus] postdeploy import OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
