import json, pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
required=[
 'data/sources/music_folk_song_expansion_registry_v40.json','data/music/folk_song_expanded_catalog_v40.json','data/music/folk_song_relation_variant_index_v40.json','data/search/music_folk_song_expanded_search_v40.json','data/security/music_folk_song_rights_policy_v40.json','data/integration/music_folk_song_youtube_metadata_worker_v40.json','data/content/source_grounded_claims_v40_additions.json','data/content/source_grounded_claims_v40_merged.json','data/content/public_source_grounded_cards_v40.json','data/search/public_search_documents_v40.json','data/ai/frontend_folk_song_source_packets_v40.json','data/admin/music_folk_song_review_queue_v40.json','backend/src/rest/musicFolkSongExpansionV40Routes.ts','database/migrations/0036_music_folk_song_expansion_v40.sql','database/seeds/036_music_folk_song_expansion_v40.sql','data/development/next_upgrade_plan_v41.json']
missing=[p for p in required if not (ROOT/p).exists()]
if missing: raise SystemExit('missing: '+str(missing))
claims=json.loads((ROOT/'data/content/source_grounded_claims_v40_additions.json').read_text())['claims']
merged=json.loads((ROOT/'data/content/source_grounded_claims_v40_merged.json').read_text())
catalog=json.loads((ROOT/'data/music/folk_song_expanded_catalog_v40.json').read_text())
assert len(claims)==58, len(claims)
assert merged['counts']['merged_total']==647, merged['counts']
assert catalog['counts']['v40_additions']==50, catalog['counts']
text='\n'.join((ROOT/p).read_text(encoding='utf-8') for p in required if (ROOT/p).suffix in ['.json','.ts','.md'])
for term in ['full_lyrics_storage_allowed','youtube_audio_download_allowed','unlicensed_training_allowed']:
    assert term not in text
openapi=json.loads((ROOT/'openapi/pinuyumayan-main-site-api.openapi.json').read_text())
assert len(openapi['paths'])>=310
print('music folk song expansion v40 OK: 58 new claims, 50 new candidates, 647 merged claims, '+str(len(openapi['paths']))+' OpenAPI paths, v41 plan included')
