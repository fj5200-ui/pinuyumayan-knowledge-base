#!/usr/bin/env python3
import json, pathlib, sys
root=pathlib.Path(__file__).resolve().parents[1]
errors=[]
def load(p): return json.loads((root/p).read_text())
cat=load('data/music/folk_song_deep_catalog_v38.json')
claims=load('data/content/source_grounded_claims_v38_additions.json')
merged=load('data/content/source_grounded_claims_v38_merged.json')
packets=load('data/ai/frontend_folk_song_source_packets_v38.json')
openapi=load('openapi/pinuyumayan-main-site-api.openapi.json')
if cat['counts']['v38_additions'] < 35: errors.append('expected at least 35 v38 candidates')
if claims['count'] < 55: errors.append('expected at least 55 v38 claims')
if merged['counts']['merged_total'] < 530: errors.append('merged claims too low')
if any((not i.get('no_lyrics')) or (not i.get('no_audio_download')) or (not i.get('no_model_training')) for i in cat['items']): errors.append('all catalog items must remain no_lyrics/no_audio_download/no_model_training')
blocked=['卑南文化遺址','卑南遺址','Peinan Site','Beinan Site']
blob=json.dumps(packets, ensure_ascii=False)
if any(term in blob for term in blocked): errors.append('forbidden archaeology terms leaked into source packets')
for p in ['/api/ops/music-folk-song/v38/catalog','/api/ops/music-folk-song/v38/variant-index','/api/public/true-knowledge/v38/music/cards','/api/public/ai-article/v38/music-source-packets','/api/ops/next-upgrade-plan/v39']:
    if p not in openapi['paths']: errors.append('missing openapi path '+p)
server=(root/'backend/src/server.ts').read_text()
if 'registerMusicFolkSongDeepV38Routes(app)' not in server: errors.append('server route registration missing')
if errors:
    print('v38 validation failed:')
    [print('-',e) for e in errors]
    sys.exit(1)
print(f"music folk song deep v38 OK: {claims['count']} new claims, {cat['counts']['v38_additions']} new candidates, {merged['counts']['merged_total']} merged claims, {len(openapi['paths'])} OpenAPI paths, v39 plan included")
