import json, pathlib, re
ROOT=pathlib.Path(__file__).resolve().parents[1]
required=[
 'data/audio/tts_stt_training_policy_v41.json','data/audio/tts_stt_training_manifest_v41.json','data/audio/tts_stt_quality_gate_v41.json',
 'data/integration/youtube_data_api_worker_v41.json','data/admin/music_review_ui_v41.json','data/integration/authority_music_source_adapters_v41.json','data/search/mysql_fulltext_music_index_v41.json','data/security/ai_music_guardrails_v41.json','data/database/vps_music_transaction_contract_v41.json','data/content/source_grounded_claims_v41_additions.json','data/content/source_grounded_claims_v41_merged.json','backend/src/rest/ttsSttMusicOpsV41Routes.ts','database/migrations/0037_tts_stt_music_ops_v41.sql','database/seeds/037_tts_stt_music_ops_v41.sql','scripts/youtube_metadata_worker_v41.py','scripts/build_tts_stt_training_manifest_v41.py','scripts/build_music_fulltext_seed_v41.py','webapp/components/MusicTtsSttOpsDashboardV41.tsx','data/development/next_upgrade_plan_v42.json']
missing=[p for p in required if not (ROOT/p).exists()]
if missing: raise SystemExit('missing: '+str(missing))
claims=json.loads((ROOT/'data/content/source_grounded_claims_v41_additions.json').read_text(encoding='utf-8'))['claims']
merged=json.loads((ROOT/'data/content/source_grounded_claims_v41_merged.json').read_text(encoding='utf-8'))
policy=json.loads((ROOT/'data/audio/tts_stt_training_policy_v41.json').read_text(encoding='utf-8'))
manifest=json.loads((ROOT/'data/audio/tts_stt_training_manifest_v41.json').read_text(encoding='utf-8'))
openapi=json.loads((ROOT/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
assert len(claims)==25, len(claims)
assert merged['counts']['merged_total']==672, merged['counts']
assert policy['public_synthetic_tts_enabled'] is False
assert policy['public_stt_music_transcription_enabled'] is False
assert manifest['safety_flags']['no_youtube_audio'] is True
assert manifest['counts']['candidate_items']==80
assert manifest['counts']['train_ready_items']==0
server=(ROOT/'backend/src/server.ts').read_text(encoding='utf-8')
assert 'registerTtsSttMusicOpsV41Routes(app);' in server
assert 'enforceInternalHmacV32' in server
text='\n'.join((ROOT/p).read_text(encoding='utf-8') for p in required if (ROOT/p).suffix in ['.json','.ts','.md','.py','.sql'])
for forbidden in ['youtube_audio_download_allowed','download_youtube_audio_allowed','full_lyrics_storage_allowed','unlicensed_training_allowed']:
    assert forbidden not in text, forbidden
for term in ['卑南文化遺址','Beinan Site','Peinan Site']:
    assert term in text
assert len(openapi['paths'])>=333, len(openapi['paths'])
for path in ['/api/ops/speech-training/v41/policy','/api/internal/music-folk-song/v41/youtube-metadata-report','/api/internal/search/music/v41/populate-fulltext']:
    assert path in openapi['paths'], path
print(f"tts/stt music ops v41 OK: {len(claims)} new claims, {manifest['counts']['candidate_items']} speech candidates, {merged['counts']['merged_total']} merged claims, {len(openapi['paths'])} OpenAPI paths, v42 plan included")
