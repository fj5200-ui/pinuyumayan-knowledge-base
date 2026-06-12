import json, pathlib, zipfile, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
required = [
 'data/sources/music_folk_song_expansion_registry_v39.json',
 'data/music/folk_song_expanded_catalog_v39.json',
 'data/music/folk_song_variant_index_v39.json',
 'data/content/source_grounded_claims_v39_additions.json',
 'data/content/source_grounded_claims_v39_merged.json',
 'data/content/public_source_grounded_cards_v39.json',
 'data/search/public_search_documents_v39.json',
 'data/ai/frontend_folk_song_source_packets_v39.json',
 'data/security/music_folk_song_rights_policy_v39.json',
 'data/admin/music_folk_song_review_queue_v39.json',
 'data/integration/music_folk_song_metadata_worker_v39.json',
 'backend/src/rest/musicFolkSongExpansionV39Routes.ts',
 'database/migrations/0035_music_folk_song_expansion_v39.sql',
 'database/seeds/035_music_folk_song_expansion_v39.sql',
 'data/development/next_upgrade_plan_v40.json'
]
missing=[p for p in required if not (ROOT/p).exists()]
if missing: raise SystemExit('missing: '+str(missing))
claims=json.loads((ROOT/'data/content/source_grounded_claims_v39_additions.json').read_text())['claims']
merged=json.loads((ROOT/'data/content/source_grounded_claims_v39_merged.json').read_text())
catalog=json.loads((ROOT/'data/music/folk_song_expanded_catalog_v39.json').read_text())
assert len(claims)==57, len(claims)
assert merged['counts']['merged_total']==589, merged['counts']
assert catalog['counts']['v39_additions']==49, catalog['counts']
# no lyrics/audio/training violations in public cards
text='\n'.join((ROOT/p).read_text(encoding='utf-8') for p in required if (ROOT/p).suffix in ['.json','.ts','.md'])
for term in ['full_lyrics_storage_allowed','youtube_audio_download_allowed','unlicensed_training_allowed']:
    assert term not in text
openapi=json.loads((ROOT/'openapi/pinuyumayan-main-site-api.openapi.json').read_text())
assert len(openapi['paths'])>=278, len(openapi['paths'])
print('music folk song expansion v39 OK: 57 new claims, 49 new candidates, 589 merged claims, '+str(len(openapi['paths']))+' OpenAPI paths, v40 plan included')
