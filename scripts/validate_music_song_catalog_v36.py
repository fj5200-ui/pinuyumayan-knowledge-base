#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
required=[
 'data/sources/music_song_source_registry_v36.json',
 'data/music/song_catalog_v36.json',
 'data/search/music_song_expanded_search_v36.json',
 'data/security/music_song_rights_policy_v36.json',
 'data/integration/youtube_song_metadata_worker_v36.json',
 'data/content/source_grounded_claims_v36_additions.json',
 'data/content/source_grounded_claims_v36_merged.json',
 'data/content/public_source_grounded_cards_v36.json',
 'data/search/public_search_documents_v36.json',
 'data/ai/frontend_music_song_source_packets_v36.json',
 'data/admin/music_song_review_queue_v36.json',
 'database/migrations/0032_music_song_catalog_v36.sql',
 'database/seeds/032_music_song_catalog_v36.sql',
 'backend/src/rest/musicSongCatalogV36Routes.ts',
 'frontend-sdk/pinuyumayanMusicSongClient.v36.ts',
 'docs/music_song_catalog_v36.md',
 'data/development/next_upgrade_plan_v37.json',
]
for rel in required:
    if not (ROOT/rel).exists(): raise SystemExit(f'missing {rel}')
claims=json.loads((ROOT/'data/content/source_grounded_claims_v36_additions.json').read_text(encoding='utf-8'))['claims']
if len(claims)<60: raise SystemExit(f'too few v36 claims: {len(claims)}')
fps=[c['canonical_fingerprint'] for c in claims]
if len(fps)!=len(set(fps)): raise SystemExit('duplicate fingerprints')
for c in claims:
    txt=c.get('statement_zh','')
    if ('卑南文化遺址' in txt or 'Beinan Site' in txt or 'Peinan Site' in txt) and c.get('category')!='禁止關聯' and '不得' not in txt and '禁止' not in txt:
        raise SystemExit('forbidden archaeology relation leaked into normal claim')
    if '歌詞' in txt and not any(k in txt for k in ['不得','不保存','不收錄','不提供','不抓','不生成']):
        raise SystemExit('lyrics policy not explicit')
    if not c.get('no_audio_download') or not c.get('no_lyrics'):
        raise SystemExit('music claim must disable audio/lyrics')
policy=json.loads((ROOT/'data/security/music_song_rights_policy_v36.json').read_text(encoding='utf-8'))
for rid in ['no_lyrics_storage','no_youtube_audio_download','no_unlicensed_training','beinan_site_forbidden_relation']:
    if not any(r['rule_id']==rid for r in policy['rules']): raise SystemExit(f'missing rights rule {rid}')
config=json.loads((ROOT/'data/search/music_song_expanded_search_v36.json').read_text(encoding='utf-8'))
if not config.get('never_download_audio') or not config.get('never_store_lyrics'): raise SystemExit('config must disable audio/lyrics')
catalog=json.loads((ROOT/'data/music/song_catalog_v36.json').read_text(encoding='utf-8'))['items']
if len(catalog)<40: raise SystemExit('song catalog too small')
for item in catalog:
    if not item.get('no_lyrics') or not item.get('no_audio_download'): raise SystemExit('catalog item missing rights flags')
packets=json.loads((ROOT/'data/ai/frontend_music_song_source_packets_v36.json').read_text(encoding='utf-8'))['packets']
for p in packets:
    if 'Beinan Site' not in p.get('blocked_terms',[]): raise SystemExit('packet missing blocked terms')
spec=json.loads((ROOT/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
for path in ['/api/ops/music-song/v36/catalog','/api/public/true-knowledge/v36/music/cards','/api/public/ai-article/v36/music-source-packets','/api/ops/next-upgrade-plan/v37']:
    if path not in spec.get('paths',{}): raise SystemExit(f'missing openapi {path}')
server=(ROOT/'backend/src/server.ts').read_text(encoding='utf-8')
if 'registerMusicSongCatalogV36Routes(app)' not in server: raise SystemExit('server missing v36 route registration')
merged=json.loads((ROOT/'data/content/source_grounded_claims_v36_merged.json').read_text(encoding='utf-8'))['counts']['merged_total']
print(f'music song catalog v36 OK: {len(claims)} new claims, {len(catalog)} song candidates, {merged} merged claims, {len(spec.get("paths",{}))} OpenAPI paths, v37 plan included')
