#!/usr/bin/env python3
import argparse, hashlib, os, secrets, sys
from datetime import datetime, timezone

def strong(pw: str) -> list[str]:
    failures=[]
    if len(pw)<14: failures.append('at least 14 characters')
    if not any(c.isupper() for c in pw): failures.append('uppercase')
    if not any(c.islower() for c in pw): failures.append('lowercase')
    if not any(c.isdigit() for c in pw): failures.append('number')
    if not any(not c.isalnum() for c in pw): failures.append('symbol')
    return failures

def sql_quote(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--emit-sql', action='store_true')
    args=ap.parse_args()
    email=os.environ.get('ADMIN_SUPERUSER_EMAIL','').strip().lower()
    password=os.environ.get('ADMIN_SUPERUSER_PASSWORD','')
    display=os.environ.get('ADMIN_SUPERUSER_DISPLAY_NAME','平台超級管理員')
    if not email or not password:
        sys.exit('ADMIN_SUPERUSER_EMAIL and ADMIN_SUPERUSER_PASSWORD are required')
    failures=strong(password)
    if failures:
        sys.exit('Weak ADMIN_SUPERUSER_PASSWORD: missing ' + ', '.join(failures))
    salt=secrets.token_hex(16)
    digest=hashlib.scrypt(password.encode(), salt=salt.encode(), n=2**14, r=8, p=1, dklen=64).hex()
    encoded=f'scrypt${salt}${digest}'
    if args.emit_sql:
        print('-- Generated superadmin seed. Contains password_hash only; do not commit if generated with real production identity.')
        print('START TRANSACTION;')
        print(f"INSERT INTO admin_users (email, display_name, password_hash, status, is_super_admin, must_change_password) VALUES ({sql_quote(email)}, {sql_quote(display)}, {sql_quote(encoded)}, 'pending_rotation', 1, 1) ON DUPLICATE KEY UPDATE display_name=VALUES(display_name), password_hash=VALUES(password_hash), status='pending_rotation', is_super_admin=1, must_change_password=1;")
        print(f"INSERT INTO admin_user_roles (admin_user_id, role_key) SELECT id, 'super_admin' FROM admin_users WHERE email={sql_quote(email)} ON DUPLICATE KEY UPDATE role_key=VALUES(role_key);")
        print(f"INSERT INTO main_site_superadmin_links (admin_user_id, main_site_email, sync_status) SELECT id, {sql_quote(os.environ.get('MAIN_SITE_SUPERADMIN_EMAIL', email).strip().lower())}, 'pending' FROM admin_users WHERE email={sql_quote(email)} ON DUPLICATE KEY UPDATE sync_status='pending', updated_at=CURRENT_TIMESTAMP;")
        print('COMMIT;')
    else:
        print(encoded)
if __name__ == '__main__': main()
