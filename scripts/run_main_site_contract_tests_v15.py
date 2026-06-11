#!/usr/bin/env python3
import argparse, json, sys, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = ROOT / "data/integration/main_site_contract_tests_v15.json"

def request(base_url: str, method: str, path: str, headers=None):
    req = urllib.request.Request(base_url.rstrip('/') + path, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            res.read()
            return res.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception as e:
        print(f"ERROR {method} {path}: {e}")
        return 0

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base-url', required=True)
    ap.add_argument('--api-key', default='')
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()
    spec = json.loads(SPEC.read_text(encoding='utf-8'))
    total = 0
    failed = 0
    for suite in spec['suites']:
        for case in suite['cases']:
            total += 1
            if args.dry_run:
                continue
            method = case.get('method','GET')
            path = case['path']
            if 'expect_status' in case:
                status = request(args.base_url, method, path)
                if status != case['expect_status']:
                    print(f"FAIL {case['id']}: expected {case['expect_status']} got {status}")
                    failed += 1
            elif 'expect_status_without_key' in case:
                status = request(args.base_url, method, path)
                if status != case['expect_status_without_key']:
                    print(f"FAIL {case['id']} without key: expected {case['expect_status_without_key']} got {status}")
                    failed += 1
                if args.api_key:
                    status = request(args.base_url, method, path, {'x-pinuyumayan-main-site-key': args.api_key})
                    if status != case['expect_status_with_key']:
                        print(f"FAIL {case['id']} with key: expected {case['expect_status_with_key']} got {status}")
                        failed += 1
    if failed:
        print(f"contract tests failed: {failed}/{total}")
        return 1
    print(f"contract tests OK: {total} cases" + (" dry-run" if args.dry_run else ""))
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
