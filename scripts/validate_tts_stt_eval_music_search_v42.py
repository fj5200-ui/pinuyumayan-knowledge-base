import json, pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
required=['data/audio/tts_stt_authorized_dataset_review_v42.json','data/audio/tts_stt_dataset_split_v42.json','data/audio/tts_stt_evaluation_report_schema_v42.json','data/audio/speech_alignment_review_queue_v42.json','data/search/public_music_search_api_v42.json','data/integration/authority_source_fetch_worker_v42.json','data/admin/music_speech_live_db_dashboard_v42.json','data/database/vps_tts_stt_transaction_schema_v42.json','data/security/ai_music_speech_guardrails_v42.json','data/content/source_grounded_claims_v42_additions.json','data/content/source_grounded_claims_v42_merged.json','backend/src/rest/ttsSttEvalMusicSearchV42Routes.ts','database/migrations/0038_tts_stt_eval_music_search_v42.sql','database/seeds/038_tts_stt_eval_music_search_v42.sql','scripts/build_tts_stt_split_v42.py','scripts/authority_source_fetch_worker_v42.py','scripts/build_music_search_index_v42.py','webapp/components/TtsSttEvaluationDashboardV42.tsx','data/development/next_upgrade_plan_v43.json']
missing=[p for p in required if not (ROOT/p).exists()]
if missing: raise SystemExit('missing: '+str(missing))
claims=json.loads((ROOT/'data/content/source_grounded_claims_v42_additions.json').read_text(encoding='utf-8'))['claims']
merged=json.loads((ROOT/'data/content/source_grounded_claims_v42_merged.json').read_text(encoding='utf-8'))
review=json.loads((ROOT/'data/audio/tts_stt_authorized_dataset_review_v42.json').read_text(encoding='utf-8'))
split=json.loads((ROOT/'data/audio/tts_stt_dataset_split_v42.json').read_text(encoding='utf-8'))
openapi=json.loads((ROOT/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
assert len(claims)==30, len(claims)
assert merged['counts']['merged_total']==702, merged['counts']
assert review['public_synthetic_tts_enabled'] is False
assert review['public_stt_enabled'] is False
assert review['counts']['candidate_items']==80
assert review['counts']['train_ready_items']==0
assert split['current_split']['blocked_candidates']==80
server=(ROOT/'backend/src/server.ts').read_text(encoding='utf-8')
assert 'registerTtsSttEvalMusicSearchV42Routes(app);' in server
for path in ['/api/ops/speech-training/v42/authorized-review','/api/internal/speech-training/v42/evaluation-report','/api/public/search/music','/api/ops/authority-sources/v42/worker-contract','/api/ops/next-upgrade-plan/v43']:
    assert path in openapi['paths'], path
text='\n'.join((ROOT/p).read_text(encoding='utf-8') for p in required if (ROOT/p).suffix in ['.json','.ts','.md','.py','.sql'])
for bad in ['download_youtube_audio_allowed','full_lyrics_storage_allowed','unlicensed_training_allowed']:
    assert bad not in text
for term in ['卑南文化遺址','Beinan Site','Peinan Site']:
    assert term in text
print(f"tts/stt eval music search v42 OK: {len(claims)} new claims, {review['counts']['candidate_items']} speech candidates, {merged['counts']['merged_total']} merged claims, {len(openapi['paths'])} OpenAPI paths, v43 plan included")
