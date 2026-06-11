#!/usr/bin/env python3
from __future__ import annotations
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def load(rel: str):
    with (ROOT / rel).open(encoding='utf-8') as f:
        return json.load(f)

def fail(msg: str):
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)

sources = load('data/sources/official_source_registry_v18.json')['sources']
claims = load('data/content/source_grounded_claims_v18.json')['claims']
cards = load('data/content/public_source_grounded_cards_v18.json')['items']
blueprints = load('data/ai/article_blueprints_v18.json')
policy = load('data/ai/article_publication_policy_v18.json')
openapi = load('openapi/pinuyumayan-main-site-api.openapi.json')

source_ids = {s['source_id'] for s in sources}
if len(source_ids) != len(sources): fail('duplicate source_id in v18 source registry')
if not any(s['trust_level'] == 'official_primary' for s in sources): fail('at least one official_primary source is required')

claim_ids = [c['claim_id'] for c in claims]
if len(claim_ids) != len(set(claim_ids)): fail('duplicate claim_id')
fps = [c['canonical_fingerprint'] for c in claims]
if len(fps) != len(set(fps)): fail('duplicate claim canonical_fingerprint')
for c in claims:
    if not c.get('source_ids'): fail(f"claim {c['claim_id']} missing source_ids")
    if any(sid not in source_ids for sid in c['source_ids']): fail(f"claim {c['claim_id']} references unknown source")
    if not c.get('evidence_locator'): fail(f"claim {c['claim_id']} missing evidence locator")
    if c['sensitivity'] != 'low' and c['public_use'] != 'public_summary_only': fail(f"sensitive claim {c['claim_id']} must be public_summary_only")

card_slugs = [c['slug'] for c in cards]
if len(card_slugs) != len(set(card_slugs)): fail('duplicate card slug')
card_fps = [c['canonical_fingerprint'] for c in cards]
if len(card_fps) != len(set(card_fps)): fail('duplicate card fingerprint')

all_claims = set(claim_ids)
if blueprints['policy'].get('public_auto_publish') is not False: fail('AI article public_auto_publish must be false')
if blueprints['policy'].get('requires_human_review_before_publish') is not True: fail('human review must be required')
for bp in blueprints['blueprints']:
    if not bp.get('required_claim_ids') or len(bp['required_claim_ids']) < 3:
        fail(f"blueprint {bp.get('blueprint_id')} must require at least 3 claims")
    missing = [cid for cid in bp['required_claim_ids'] if cid not in all_claims]
    if missing: fail(f"blueprint {bp['blueprint_id']} missing claims {missing}")

if policy['deduplication']['hard_block_rules'].count('same_slug_exists') != 1:
    fail('dedup hard_block_rules must include same_slug_exists once')

required_paths = [
    '/api/public/ai-article/source-packets',
    '/api/public/ai-article/blueprints',
    '/api/internal/ai-article/draft-plan',
    '/api/internal/ai-article/duplicate-check',
    '/api/internal/ai-article/publish-check',
    '/api/admin/ai-article/review-queue'
]
paths = openapi.get('paths', {})
for p in required_paths:
    if p not in paths: fail(f'OpenAPI missing {p}')

server = (ROOT / 'backend/src/server.ts').read_text(encoding='utf-8')
if 'registerAiArticleRoutes' not in server: fail('server.ts must register AI article routes')
route_file = ROOT / 'backend/src/rest/aiArticleRoutes.ts'
if not route_file.exists(): fail('aiArticleRoutes.ts missing')
route_text = route_file.read_text(encoding='utf-8')
if 'requireInternalApiKey' not in route_text: fail('internal AI article routes must require API key')
if 'publicAutoPublish: false' not in (ROOT / 'backend/src/modules/aiArticle/service.ts').read_text(encoding='utf-8'):
    fail('draft service must force publicAutoPublish false')

migration = (ROOT / 'database/migrations/0016_ai_article_grounding_no_duplicate_v18.sql').read_text(encoding='utf-8')
for table in ['knowledge_source_documents_v18','knowledge_source_claims_v18','ai_article_draft_plans_v18','article_duplicate_fingerprints_v18','article_publish_checks_v18']:
    if table not in migration: fail(f'migration missing {table}')
if 'UNIQUE' not in migration or 'canonical_fingerprint' not in migration: fail('migration must enforce fingerprint uniqueness')

print(f"AI article grounding v18 OK: {len(sources)} sources, {len(claims)} unique claims, {len(cards)} cards, {len(blueprints['blueprints'])} blueprints, {len(paths)} OpenAPI paths")
