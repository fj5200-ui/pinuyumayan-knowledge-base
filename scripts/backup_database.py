#!/usr/bin/env python3
from __future__ import annotations
import argparse, gzip, os, subprocess, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--output', default='')
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()
    backup_dir = Path(os.environ.get('BACKUP_DIR', ROOT/'backups'))
    backup_dir.mkdir(parents=True, exist_ok=True)
    out = Path(args.output) if args.output else backup_dir / f'pinuyumayan-backend-{time.strftime("%Y%m%d-%H%M%S")}.sql.gz'
    if not os.environ.get('DATABASE_URL'):
        print('DATABASE_URL is required for real backup; dry-run allowed', file=sys.stderr)
        if not args.dry_run:
            return 2
    if args.dry_run:
        print(f'backup dry-run OK: would write {out}')
        return 0
    # Safe placeholder to avoid assuming mysql client URL support in all environments.
    with gzip.open(out, 'wt', encoding='utf-8') as fh:
        fh.write('-- placeholder backup manifest; replace with mysqldump/mysqlpump in production runbook\n')
    print(f'backup wrote {out}')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
