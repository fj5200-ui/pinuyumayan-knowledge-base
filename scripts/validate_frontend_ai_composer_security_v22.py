import json, re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def load(rel):
    return json.loads((ROOT / rel).read_text(encoding='utf-8'))

errors=[]
add = load('data/content/source_grounded_claims_v22_additions.json')
merged = load('data/content/source_grounded_claims_v22_merged.json')
op = load('openapi/pinuyumayan-main-site-api.openapi.json')
policy = load('data/security/internal_api_hmac_nonce_policy_v22.json')
adapters = load('data/ai/frontend_ai_provider_adapters_v22.json')
next_plan = load('data/development/next_upgrade_plan_v23.json')

if add['count'] != len(add['claims']): errors.append('v22 additions count mismatch')
if add['count'] < 20: errors.append('expected at least 20 v22 claims')
fp = [c['canonical_fingerprint'] for c in merged['claims']]
if len(fp) != len(set(fp)): errors.append('duplicate canonical_fingerprint in merged claims')
for c in add['claims']:
    text = c['statement_zh']
    if any(term in text for term in ['卑南文化遺址','卑南遺址','Beinan Site','Peinan Site']):
        errors.append(f'forbidden archaeology term leaked into claim {c["claim_id"]}')
    if c.get('sensitivity') in ('medium','high') and 'article_guardrail' not in c:
        errors.append(f'missing guardrail for sensitive claim {c["claim_id"]}')
for required in ['x-pinuyumayan-timestamp','x-pinuyumayan-nonce','x-pinuyumayan-signature']:
    if required not in policy['required_headers']:
        errors.append(f'missing security header {required}')
if 'openai_responses_adapter' not in [p['provider_id'] for p in adapters['providers']]: errors.append('missing openai adapter')
if 'kimi_chat_adapter' not in [p['provider_id'] for p in adapters['providers']]: errors.append('missing kimi adapter')
if len(op.get('paths',{})) < 90: errors.append('expected at least 90 OpenAPI paths after v22')
if next_plan['version'] != 'v23': errors.append('next plan should be v23')
for rel in [
    'backend/src/security/hmacNonceGuard.ts',
    'backend/src/modules/frontendAiComposerV22/service.ts',
    'backend/src/rest/frontendAiComposerV22Routes.ts',
    'frontend-sdk/frontendAiComposerClient.v22.ts',
    'webapp/components/FrontendAiComposerV22.tsx',
    'webapp/components/AdminArticleReviewDashboardV22.tsx',
    'database/migrations/0020_frontend_ai_composer_security_v22.sql',
    'database/seeds/020_frontend_ai_composer_security_v22.sql',
    'docs/next_upgrade_plan_v23.md'
]:
    if not (ROOT/rel).exists(): errors.append(f'missing file {rel}')
if errors:
    print('\n'.join(errors))
    sys.exit(1)
print(f'frontend AI composer security v22 OK: {add["count"]} new claims, {len(merged["claims"])} merged claims, {len(op["paths"])} OpenAPI paths, v23 plan included')
