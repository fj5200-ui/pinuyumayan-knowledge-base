-- v41 TTS/STT training + music ops implementation layer
CREATE TABLE IF NOT EXISTS puyuma_speech_training_datasets_v41 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  dataset_key VARCHAR(128) NOT NULL UNIQUE,
  dataset_type ENUM('tts','stt','pronunciation_eval') NOT NULL,
  release_channel VARCHAR(64) NOT NULL DEFAULT 'speech_training_candidate',
  item_count INT NOT NULL DEFAULT 0,
  train_ready_count INT NOT NULL DEFAULT 0,
  license_approved_count INT NOT NULL DEFAULT 0,
  no_youtube_audio BOOLEAN NOT NULL DEFAULT TRUE,
  status VARCHAR(64) NOT NULL DEFAULT 'candidate_needs_review',
  report_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS puyuma_speech_training_items_v41 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  dataset_key VARCHAR(128) NOT NULL,
  asset_id VARCHAR(128) NOT NULL,
  source_id VARCHAR(160) NOT NULL,
  dialect_code VARCHAR(32) NULL,
  speaker_id VARCHAR(128) NULL,
  split_name ENUM('candidate_pool','train','dev','test','blocked') NOT NULL DEFAULT 'candidate_pool',
  transcript_status VARCHAR(64) NOT NULL DEFAULT 'candidate_needs_alignment_review',
  license_status VARCHAR(64) NOT NULL DEFAULT 'candidate_requires_review',
  allowed_for_tts_training BOOLEAN NOT NULL DEFAULT FALSE,
  allowed_for_stt_training BOOLEAN NOT NULL DEFAULT FALSE,
  metadata_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_speech_dataset_v41(dataset_key),
  INDEX idx_speech_dialect_v41(dialect_code)
);
CREATE TABLE IF NOT EXISTS puyuma_tts_training_runs_v41 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_key VARCHAR(128) NOT NULL UNIQUE,
  dataset_key VARCHAR(128) NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'queued',
  mos_score DECIMAL(4,2) NULL,
  quality_report_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS puyuma_stt_training_runs_v41 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_key VARCHAR(128) NOT NULL UNIQUE,
  dataset_key VARCHAR(128) NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'queued',
  wer DECIMAL(6,4) NULL,
  cer DECIMAL(6,4) NULL,
  quality_report_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_youtube_metadata_runs_v41 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_key VARCHAR(128) NOT NULL UNIQUE,
  query_text VARCHAR(255) NOT NULL,
  candidate_count INT NOT NULL DEFAULT 0,
  blocked_count INT NOT NULL DEFAULT 0,
  status VARCHAR(64) NOT NULL DEFAULT 'received',
  report_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_youtube_metadata_candidates_v41 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_key VARCHAR(128) NOT NULL,
  video_id VARCHAR(64) NOT NULL,
  title VARCHAR(512) NOT NULL,
  channel_title VARCHAR(255) NULL,
  published_at VARCHAR(64) NULL,
  thumbnail_url TEXT NULL,
  duration_iso8601 VARCHAR(64) NULL,
  rights_status VARCHAR(64) NOT NULL DEFAULT 'unknown',
  youtube_official_status VARCHAR(64) NOT NULL DEFAULT 'unreviewed',
  review_status VARCHAR(64) NOT NULL DEFAULT 'candidate_needs_human_review',
  metadata_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_youtube_video_v41(video_id)
);
CREATE TABLE IF NOT EXISTS music_source_adapter_runs_v41 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  adapter_id VARCHAR(128) NOT NULL,
  run_key VARCHAR(128) NOT NULL UNIQUE,
  candidate_count INT NOT NULL DEFAULT 0,
  status VARCHAR(64) NOT NULL DEFAULT 'received',
  report_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_fulltext_population_runs_v41 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_key VARCHAR(128) NOT NULL UNIQUE,
  indexed_count INT NOT NULL DEFAULT 0,
  blocked_count INT NOT NULL DEFAULT 0,
  status VARCHAR(64) NOT NULL DEFAULT 'received',
  report_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_review_transactions_v41 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  review_key VARCHAR(128) NOT NULL UNIQUE,
  candidate_id VARCHAR(128) NOT NULL,
  reviewer_id VARCHAR(128) NULL,
  action VARCHAR(64) NOT NULL,
  rights_status VARCHAR(64) NULL,
  sensitivity VARCHAR(64) NULL,
  review_notes TEXT NULL,
  report_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS ai_music_guardrail_events_v41 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_key VARCHAR(128) NOT NULL UNIQUE,
  draft_hash VARCHAR(128) NOT NULL,
  blocked BOOLEAN NOT NULL DEFAULT FALSE,
  findings_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_search_index_documents_v41 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  doc_id VARCHAR(160) NOT NULL UNIQUE,
  title_zh VARCHAR(512) NOT NULL,
  body_zh TEXT NOT NULL,
  artist VARCHAR(255) NULL,
  community VARCHAR(255) NULL,
  work_type VARCHAR(128) NULL,
  rights_status VARCHAR(64) NULL,
  sensitivity VARCHAR(64) NULL,
  source_authority VARCHAR(128) NULL,
  youtube_official_status VARCHAR(64) NULL,
  claim_ids_json JSON NULL,
  source_ids_json JSON NULL,
  FULLTEXT KEY ft_music_v41(title_zh, body_zh)
);
