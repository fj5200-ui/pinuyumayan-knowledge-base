#!/usr/bin/env python3
import json, pathlib, sys
root=pathlib.Path(__file__).resolve().parents[1]
required=[
 'data/auth/admin_auth_contract_v13.json','data/auth/admin_rbac_matrix_v13.json','data/auth/superadmin_bootstrap_policy_v13.json',
 'database/migrations/0009_admin_auth_main_site_superadmin.sql','database/migrations/0010_content_delivery_enrichment.sql',
 'database/seeds/008_admin_auth_roles_seed.sql','deploy/bootstrap-superadmin.sh','scripts/bootstrap_superadmin.py',
 'data/content/main_site_content_packets_v13.json','data/content/main_site_content_collections_v13.json','data/content/content_enrichment_gap_register_v13.json',
 'backend/src/rest/adminAuthRoutes.ts','backend/src/rest/adminSyncRoutes.ts','backend/src/rest/contentRoutes.ts','backend/src/security/passwordHash.ts']
missing=[p for p in required if not (root/p).exists()]
if missing: sys.exit('missing v13 files: '+', '.join(missing))
contract=json.load(open(root/'data/auth/admin_auth_contract_v13.json',encoding='utf-8'))
if any('plaintext' in x.lower() for x in contract.get('principles',[])) is False:
    sys.exit('auth contract must mention plaintext password prohibition')
packets=json.load(open(root/'data/content/main_site_content_packets_v13.json',encoding='utf-8'))['items']
if len(packets)<80: sys.exit(f'expected >=80 content packets, got {len(packets)}')
if any(not item.get('source_ids') for item in packets): sys.exit('all content packets must include source_ids')
openapi=json.load(open(root/'openapi/pinuyumayan-main-site-api.openapi.json',encoding='utf-8'))
for path in ['/api/admin/auth/login','/api/internal/admin/superadmin/sync-to-main-site','/api/public/content/collections']:
    if path not in openapi.get('paths',{}): sys.exit(f'missing OpenAPI path {path}')
print(f'admin auth + content v13 OK: {len(packets)} content packets, {len(openapi.get("paths",{}))} OpenAPI paths')
