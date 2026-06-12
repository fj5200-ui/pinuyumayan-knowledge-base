#!/usr/bin/env python3
import json, sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
required=['data/deployment/production_cutover_checklist_v30.json','data/integration/main_site_cutover_acceptance_v30.json','data/seo/production_seo_launch_v30.json','data/search/search_quality_suite_v30.json','data/security/production_secret_rotation_v30.json','data/development/next_upgrade_plan_v31.json','database/migrations/0027_production_cutover_v30.sql','database/seeds/027_production_cutover_v30.sql','backend/src/rest/productionCutoverV30Routes.ts','deploy/production-cutover-v30.sh','deploy/check-production-cutover-v30.sh','deploy/rollback-production-v30.sh','docs/production_cutover_v30.md','docs/main_site_cutover_acceptance_v30.md','docs/production_seo_launch_v30.md','docs/next_upgrade_plan_v31.md']
missing=[p for p in required if not (root/p).exists()]
if missing: print('missing v30 files:', missing); sys.exit(1)
openapi=json.load(open(root/'openapi/pinuyumayan-main-site-api.openapi.json',encoding='utf-8'))
paths=openapi.get('paths',{})
needed=['/api/ops/cutover/v30/checklist','/api/ops/cutover/v30/readiness','/api/internal/cutover/v30/readiness-report','/api/ops/next-upgrade-plan/v31']
miss=[p for p in needed if p not in paths]
if miss: print('missing openapi paths', miss); sys.exit(1)
checklist=json.load(open(root/'data/deployment/production_cutover_checklist_v30.json',encoding='utf-8'))
checks=sum(len(ph.get('checks',[])) for ph in checklist.get('phases',[]))
if checks < 18: print('too few cutover checks', checks); sys.exit(1)
server=(root/'backend/src/server.ts').read_text(encoding='utf-8')
if 'registerProductionCutoverV30Routes(app)' not in server: print('server route not registered'); sys.exit(1)
suite=json.load(open(root/'data/search/search_quality_suite_v30.json',encoding='utf-8'))
forbidden_text=json.dumps(suite,ensure_ascii=False)
if '卑南文化遺址' not in forbidden_text or 'Beinan Site' not in forbidden_text: print('forbidden relation smoke tests missing'); sys.exit(1)
print(f"production cutover v30 OK: {len(required)} files, {len(paths)} OpenAPI paths, {checks} cutover checks")
