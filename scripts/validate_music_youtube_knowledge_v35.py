#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
required=[
 'data/sources/music_youtube_source_registry_v35.json',
 'data/search/music_youtube_expanded_search_v35.json',
 'data/content/source_grounded_claims_v35_additions.json',
 'data/content/source_grounded_claims_v35_merged.json',
 'data/content/public_source_grounded_cards_v35.json',
 'data/search/public_search_documents_v35.json',
 'data/ai/frontend_music_source_packets_v35.json',
 'data/security/music_rights_policy_v35.json',
 'data/admin/music_youtube_review_queue_v35.json',
 'database/migrations/0031_music_youtube_knowledge_v35.sql',
 'database/seeds/031_music_youtube_knowledge_v35.sql',
 'backend/src/rest/musicYoutubeKnowledgeV35Routes.ts',
 'frontend-sdk/pinuyumayanMusicKnowledgeClient.v35.ts',
 'docs/music_youtube_knowledge_v35.md',
 'data/development/next_upgrade_plan_v36.json',
]
for rel in required:
    if not (ROOT/rel).exists(): raise SystemExit(f'missing {rel}')
claims=json.loads((ROOT/'data/content/source_grounded_claims_v35_additions.json').read_text(encoding='utf-8'))['claims']
if len(claims)<40: raise SystemExit(f'too few v35 claims: {len(claims)}')
fps=[c['canonical_fingerprint'] for c in claims]
if len(fps)!=len(set(fps)): raise SystemExit('duplicate fingerprints')
for c in claims:
    txt=c.get('statement_zh','')
    if ('卑南文化遺址' in txt or 'Beinan Site' in txt or 'Peinan Site' in txt) and c.get('category')!='禁止關聯' and '禁止' not in txt and '不得' not in txt:
        raise SystemExit('forbidden archaeology relation leaked into normal claim')
    if '歌詞' in txt and not any(k in txt for k in ['不得','不保存','不收錄','只允許','不重製','不存','避免重製']):
        raise SystemExit('lyrics policy not explicit')
policy=json.loads((ROOT/'data/security/music_rights_policy_v35.json').read_text(encoding='utf-8'))
if not any(r['rule_id']=='no_youtube_audio_download' for r in policy['rules']): raise SystemExit('missing no youtube audio download rule')
config=json.loads((ROOT/'data/search/music_youtube_expanded_search_v35.json').read_text(encoding='utf-8'))
if not config.get('never_download_audio') or not config.get('never_store_lyrics'): raise SystemExit('youtube config must disable audio/lyrics')
packets=json.loads((ROOT/'data/ai/frontend_music_source_packets_v35.json').read_text(encoding='utf-8'))['packets']
for p in packets:
    if 'Beinan Site' not in p.get('blocked_terms',[]): raise SystemExit('packet missing blocked terms')
spec=json.loads((ROOT/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
for path in ['/api/ops/music-youtube/v35/search-config','/api/public/true-knowledge/v35/music/cards','/api/public/ai-article/v35/music-source-packets','/api/ops/next-upgrade-plan/v36']:
    if path not in spec.get('paths',{}): raise SystemExit(f'missing openapi {path}')
server=(ROOT/'backend/src/server.ts').read_text(encoding='utf-8')
if 'registerMusicYoutubeKnowledgeV35Routes(app)' not in server: raise SystemExit('server missing v35 route registration')
merged=json.loads((ROOT/'data/content/source_grounded_claims_v35_merged.json').read_text(encoding='utf-8'))['counts']['merged_total']
print(f'music youtube knowledge v35 OK: {len(claims)} new claims, {merged} merged claims, {len(spec.get("paths",{}))} OpenAPI paths, v36 plan included')
