#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def require(path: str):
    p = ROOT / path
    if not p.exists():
        raise SystemExit(f"missing required file: {path}")
    return p

required = [
  'data/integration/main_site_connection_contract_v23.json',
  'data/integration/main_site_env_matrix_v23.json',
  'data/integration/main_site_route_mapping_v23.json',
  'data/security/main_site_hmac_rotation_v23.json',
  'docs/main_site_connection_v23.md',
  'docs/main_site_env_setup_v23.md',
  'docs/main_site_server_ai_route_v23.md',
  'webapp/env.example',
  'webapp/lib/signKnowledgeRequest.ts',
  'webapp/lib/pinuyumayanKbClient.ts',
  'webapp/app/api/ai/compose/route.ts',
  'webapp/app/api/ai/validate-draft/route.ts',
  'webapp/app/api/ai/submit-review/route.ts',
  'webapp/app/api/kb/health/route.ts',
  'webapp/components/MainSiteConnectionStatusV23.tsx',
  'frontend-sdk/mainSiteKnowledgeBridge.v23.ts',
  'backend/src/security/hmacSigner.ts',
  'backend/src/modules/mainSiteConnection/service.ts',
  'backend/src/rest/mainSiteConnectionRoutes.ts',
  'database/migrations/0021_main_site_connection_v23.sql',
  'database/seeds/021_main_site_connection_v23.sql',
  'deploy/check-main-site-connection-v23.sh',
  'data/development/next_upgrade_plan_v24.json'
]
for item in required:
    require(item)

contract = json.loads(require('data/integration/main_site_connection_contract_v23.json').read_text(encoding='utf-8'))
assert contract['version'] == 'v23'
required_env = {x['name'] for x in contract['required_main_site_env']}
for key in ['NEXT_PUBLIC_KB_API_URL','PINUYUMAYAN_MAIN_SITE_API_KEY','PINUYUMAYAN_HMAC_SECRET','AI_PROVIDER']:
    assert key in required_env, key
assert contract['article_flow'][1].lower().find('openai') >= 0 or contract['article_flow'][1].lower().find('kimi') >= 0

forbidden = contract['forbidden_relation_rule'].lower()
assert 'beinan' in forbidden and 'peinan' in forbidden

openapi = json.loads(require('openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
for p in ['/api/ops/main-site-connection','/api/public/main-site-connection/config','/api/internal/ai-article/client-draft/validate']:
    assert p in openapi.get('paths', {}), f"openapi missing {p}"

print('main site connection v23 OK: env, HMAC, server AI route, SDK, docs, OpenAPI')
