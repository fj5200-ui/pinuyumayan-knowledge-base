#!/usr/bin/env python3
from __future__ import annotations
import argparse, sys
from pathlib import Path

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--input', required=True)
    ap.add_argument('--confirm', action='store_true')
    args = ap.parse_args()
    p = Path(args.input)
    if not p.exists():
        print(f'restore input not found: {p}', file=sys.stderr)
        return 2
    if not args.confirm:
        print('restore requires --confirm', file=sys.stderr)
        return 2
    print(f'restore plan accepted for {p}; wire actual mysql restore command in production environment')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
