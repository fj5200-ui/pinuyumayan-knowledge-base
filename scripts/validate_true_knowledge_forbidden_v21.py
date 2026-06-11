import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def load(rel):
    return json.loads((ROOT / rel).read_text(encoding='utf-8'))

merged = load('data/content/source_grounded_claims_v21_merged.json')
adds = load('data/content/source_grounded_claims_v21_additions.json')
policy = load('data/security/forbidden_knowledge_relations_v21.json')
openapi = load('openapi/pinuyumayan-main-site-api.openapi.json')

fps = [c['canonical_fingerprint'] for c in merged['claims']]
if len(fps) != len(set(fps)):
    raise SystemExit('duplicate canonical_fingerprint in merged claims')
ids = [c['claim_id'] for c in merged['claims']]
if len(ids) != len(set(ids)):
    raise SystemExit('duplicate claim_id in merged claims')
for term in ['卑南文化遺址','卑南遺址','卑南考古遺址','Peinan Site','Beinan Site']:
    if term not in policy['blocked_terms']:
        raise SystemExit(f'missing blocked term: {term}')
for c in adds['claims']:
    bad = [t for t in policy['blocked_terms'] if t in c['statement_zh']]
    if bad:
        raise SystemExit(f'claim includes blocked archaeology term: {c["claim_id"]} {bad}')
required_paths = [
 '/api/public/true-knowledge/v21/claims',
 '/api/public/true-knowledge/v21/cards',
 '/api/public/ai-article/v21/source-packets',
 '/api/public/knowledge/forbidden-relations/v21',
 '/api/internal/ai-article/v21/blocked-relation-check',
 '/api/ops/next-upgrade-plan/v22'
]
for p in required_paths:
    if p not in openapi['paths']:
        raise SystemExit(f'missing OpenAPI path: {p}')
print(f'true knowledge forbidden relation v21 OK: {len(adds["claims"])} new claims, {len(merged["claims"])} merged claims, {len(openapi["paths"])} OpenAPI paths')
