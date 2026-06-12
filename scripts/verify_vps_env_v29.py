#!/usr/bin/env python3
import argparse, os, shutil, sys, urllib.parse, json

FORBIDDEN_PROD_HOSTS = {'0.0.0.0', 'localhost.localdomain'}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--database', default=os.environ.get('DATABASE_URL',''))
    ap.add_argument('--mode', default=os.environ.get('NODE_ENV','development'))
    args = ap.parse_args()
    findings = []
    ok = True
    if not args.database:
        ok = False; findings.append('DATABASE_URL is missing')
    else:
        parsed = urllib.parse.urlparse(args.database)
        if parsed.scheme not in {'mysql','mariadb'}:
            ok = False; findings.append(f'Unexpected DB scheme: {parsed.scheme}')
        if args.mode == 'production' and parsed.hostname in FORBIDDEN_PROD_HOSTS:
            ok = False; findings.append(f'Unsafe production DB host: {parsed.hostname}')
    for cmd in ['python3','mysql']:
        if not shutil.which(cmd):
            ok = False; findings.append(f'missing command: {cmd}')
    if args.mode == 'production':
        findings.append('First full-corpus run should be staging, not production')
    report = {
        'version': 'v29',
        'ok': ok,
        'mode': args.mode,
        'database_url_present': bool(args.database),
        'mysql_client': bool(shutil.which('mysql')),
        'python3': bool(shutil.which('python3')),
        'findings': findings
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if not ok:
        raise SystemExit(1)

if __name__ == '__main__':
    main()
