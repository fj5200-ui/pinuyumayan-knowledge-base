-- v35 music / YouTube source candidate and rights governance layer
CREATE TABLE IF NOT EXISTS music_youtube_source_candidates_v35 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  candidate_id VARCHAR(80) NOT NULL UNIQUE,
  platform VARCHAR(40) NOT NULL DEFAULT 'youtube',
  query_text VARCHAR(255) NULL,
  video_id VARCHAR(64) NULL,
  title VARCHAR(512) NULL,
  channel_id VARCHAR(128) NULL,
  channel_title VARCHAR(255) NULL,
  source_url TEXT NULL,
  relation_status VARCHAR(80) NOT NULL DEFAULT 'candidate_needs_human_review',
  license_status VARCHAR(80) NOT NULL DEFAULT 'unknown_needs_review',
  sensitivity VARCHAR(40) NOT NULL DEFAULT 'low',
  no_audio_download BOOLEAN NOT NULL DEFAULT TRUE,
  no_lyrics_storage BOOLEAN NOT NULL DEFAULT TRUE,
  forbidden_relation_checked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_rights_review_events_v35 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  candidate_id VARCHAR(80) NOT NULL,
  reviewer VARCHAR(160) NULL,
  decision VARCHAR(80) NOT NULL,
  reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_source_packets_v35 (
  packet_id VARCHAR(120) PRIMARY KEY,
  title_zh VARCHAR(255) NOT NULL,
  claim_ids JSON NOT NULL,
  source_ids JSON NOT NULL,
  blocked_terms JSON NOT NULL,
  review_required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
