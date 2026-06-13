-- v44 base seed marker. Generated seeds are produced by:
--   python3 scripts/build_music_search_db_seed_v44.py
--   python3 scripts/authority_source_candidate_worker_v44.py
INSERT INTO speech_dataset_exports_v44 (export_id, train_count, dev_count, test_count, blocked_count, public_release_allowed, export_paths_json, report_json)
VALUES (
  'speech-export-v44-initial',
  0,
  0,
  0,
  80,
  FALSE,
  JSON_ARRAY('data/audio/exports/v44/train.jsonl','data/audio/exports/v44/dev.jsonl','data/audio/exports/v44/test.jsonl','data/audio/exports/v44/blocked_candidates.jsonl'),
  JSON_OBJECT('note','Initial v44 export is blocked until license, speaker consent and alignment are verified.')
)
ON DUPLICATE KEY UPDATE blocked_count=VALUES(blocked_count), report_json=VALUES(report_json);

INSERT INTO main_site_page_contracts_v44 (route_path, page_file, data_endpoint, seo_json, safety_json)
VALUES
('/music/search','webapp/app/music/search/page.tsx','/api/public/search/music/v43',JSON_OBJECT('og_ready', true),JSON_OBJECT('no_lyrics', true, 'no_audio_download', true)),
('/music/[id]','webapp/app/music/[id]/page.tsx','/api/public/music/v44/metadata/:id',JSON_OBJECT('og_ready', true),JSON_OBJECT('metadata_only_for_unreviewed_music', true)),
('/tts-stt','webapp/app/tts-stt/page.tsx','/api/public/speech/v44/tts-stt-info',JSON_OBJECT('og_ready', true),JSON_OBJECT('public_tts_enabled', false, 'public_stt_enabled', false))
ON DUPLICATE KEY UPDATE page_file=VALUES(page_file), data_endpoint=VALUES(data_endpoint), seo_json=VALUES(seo_json), safety_json=VALUES(safety_json);
