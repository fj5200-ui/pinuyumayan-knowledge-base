-- v35 seed: YouTube query seeds are candidates only. No lyrics/audio are inserted.
INSERT IGNORE INTO music_youtube_source_candidates_v35 (candidate_id, query_text, relation_status, license_status, no_audio_download, no_lyrics_storage, forbidden_relation_checked) VALUES
  ('ytq-v35-001','卑南族 歌謠','needs_youtube_api_fetch','unknown_needs_review',TRUE,TRUE,TRUE),
  ('ytq-v35-002','卑南族 古調','needs_youtube_api_fetch','unknown_needs_review',TRUE,TRUE,TRUE),
  ('ytq-v35-003','陸森寶 美麗的稻穗','needs_youtube_api_fetch','unknown_needs_review',TRUE,TRUE,TRUE),
  ('ytq-v35-004','Damalagaw 大巴六九部落傳唱歌謠','needs_youtube_api_fetch','unknown_needs_review',TRUE,TRUE,TRUE);
