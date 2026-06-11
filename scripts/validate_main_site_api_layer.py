#!/usr/bin/env python3
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]

required = [
  'data/integration/main_site_knowledge_api_contract.json',
  'data/integration/main_site_cache_policy.json',
  'data/integration/main_site_sync_policy.json',
  'data/integration/public_knowledge_payload_schema.json',
  'data/integration/knowledge_webhook_events.json',
  'database/migrations/0003_main_site_pull_api.sql',
  'database/seeds/007_main_site_api_client.sql',
  'backend/src/modules/mainSiteKnowledge/service.ts',
  'backend/src/modules/mainSiteKnowledge/router.ts',
  'backend/src/rest/mainSiteKnowledgeRoutes.ts',
  'backend/src/security/mainSiteAuth.ts',
  'frontend-sdk/pinuyumayanKnowledgeClient.ts',
  'docs/main_site_integration_guide.md',
  'docs/public_knowledge_api.md',
  'docs/main_site_pull_checklist.md',
]

for rel in required:
  path = ROOT / rel
  if not path.exists() or path.stat().st_size == 0:
    raise SystemExit(f'missing or empty: {rel}')

contract = json.loads((ROOT / 'data/integration/main_site_knowledge_api_contract.json').read_text(encoding='utf-8'))
paths = {e['path'] for e in contract['rest_endpoints']}
must = {
  '/api/public/knowledge/bootstrap',
  '/api/public/knowledge/search?q=...',
  '/api/public/knowledge/related?entityType=...&entityId=...',
  '/api/public/knowledge/communities/:communityKey',
  '/api/public/knowledge/vocabulary',
  '/api/internal/main-site/knowledge/bundle',
  '/api/internal/main-site/knowledge/delta?since=...'
}
missing = must - paths
if missing:
  raise SystemExit(f'missing endpoint contract: {missing}')

root_ts = (ROOT / 'backend/src/trpc/root.ts').read_text(encoding='utf-8')
if 'mainSiteKnowledgeRouter' not in root_ts or 'mainSiteKnowledge:' not in root_ts:
  raise SystemExit('tRPC root missing mainSiteKnowledge router')

server_ts = (ROOT / 'backend/src/server.ts').read_text(encoding='utf-8')
if 'registerMainSiteKnowledgeRoutes(app, createContext)' not in server_ts:
  raise SystemExit('server.ts missing REST route registration')

migration = (ROOT / 'database/migrations/0003_main_site_pull_api.sql').read_text(encoding='utf-8')
for token in ['api_clients', 'knowledge_sync_cursors', 'vw_main_site_vocabulary_audio', 'vw_main_site_search_documents']:
  if token not in migration:
    raise SystemExit(f'migration missing {token}')

print('main site API layer OK: public REST, internal sync, cache policy, SDK, migration')

if __name__ == '__main__':
  pass
