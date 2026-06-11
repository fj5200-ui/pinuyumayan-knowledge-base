#!/usr/bin/env python3
"""Main-site API contract verifier.
Uses stdlib urllib so it can run on VPS without extra dependencies.
"""
from __future__ import annotations
import argparse, json, os, sys, urllib.error, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def has_path(obj, path):
    cur = obj
    for key in path:
        if isinstance(cur, dict) and key in cur:
            cur = cur[key]
        else:
            return False
    return True

def request(base, test, api_key):
    url = base.rstrip('/') + test['path']
    req = urllib.request.Request(url, method=test['method'])
    if test.get('auth') == 'mainSiteApiKey':
        req.add_header('x-pinuyumayan-main-site-key', api_key)
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            body = res.read().decode('utf-8')
            status = res.status
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        status = e.code
    return status, body

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--base-url', default=os.environ.get('PUBLIC_KNOWLEDGE_BASE_URL', 'http://localhost:8787'))
    ap.add_argument('--skip-network', action='store_true')
    args = ap.parse_args()
    spec = json.loads((ROOT/'data/integration/main_site_contract_tests_v8.json').read_text(encoding='utf-8'))
    if args.skip_network:
        print(f"main-site contract spec OK: {len(spec['tests'])} tests")
        return 0
    api_key = os.environ.get('PINUYUMAYAN_MAIN_SITE_API_KEY', '')
    failed = 0
    for test in spec['tests']:
        status, body = request(args.base_url, test, api_key)
        if status != test['expectStatus']:
            print(f"FAIL {test['id']}: status {status}, expected {test['expectStatus']}", file=sys.stderr)
            failed += 1
            continue
        if 'expectJsonPath' in test and status < 400:
            try:
                data = json.loads(body)
            except json.JSONDecodeError:
                print(f"FAIL {test['id']}: response is not JSON", file=sys.stderr)
                failed += 1
                continue
            if not has_path(data, test['expectJsonPath']):
                print(f"FAIL {test['id']}: missing path {test['expectJsonPath']}", file=sys.stderr)
                failed += 1
                continue
        print(f"PASS {test['id']}")
    if failed:
        return 1
    print('main-site contract OK')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
