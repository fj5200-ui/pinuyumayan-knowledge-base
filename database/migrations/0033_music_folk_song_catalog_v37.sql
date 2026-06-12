-- 0033_music_folk_song_catalog_v37.sql
-- v37: folk song / old song / YouTube metadata candidate governance.
CREATE TABLE IF NOT EXISTS music_folk_song_candidates_v37 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  song_id VARCHAR(96) NOT NULL UNIQUE,
  title_zh VARCHAR(255) NOT NULL,
  artist_or_source VARCHAR(255),
  work_type VARCHAR(96) NOT NULL,
  community_tags JSON NULL,
  source_ids JSON NOT NULL,
  rights_status VARCHAR(64) NOT NULL DEFAULT 'unknown_needs_review',
  review_status VARCHAR(64) NOT NULL DEFAULT 'candidate_needs_authoritative_review',
  no_lyrics BOOLEAN NOT NULL DEFAULT TRUE,
  no_audio_download BOOLEAN NOT NULL DEFAULT TRUE,
  forbidden_relation_checked BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_youtube_source_candidates_v37 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  video_id VARCHAR(64) NOT NULL UNIQUE,
  title VARCHAR(512) NOT NULL,
  channel_title VARCHAR(255),
  channel_id VARCHAR(128),
  published_at DATETIME NULL,
  thumbnail_url TEXT NULL,
  duration_iso8601 VARCHAR(64),
  query_seed VARCHAR(255),
  candidate_status VARCHAR(64) NOT NULL DEFAULT 'candidate_needs_review',
  no_audio_download BOOLEAN NOT NULL DEFAULT TRUE,
  no_lyrics BOOLEAN NOT NULL DEFAULT TRUE,
  blocked_relation_hit BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_folk_song_review_events_v37 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  candidate_id VARCHAR(96) NOT NULL,
  action VARCHAR(64) NOT NULL,
  reviewer_id VARCHAR(128),
  reason TEXT,
  result_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_folk_song_rights_checks_v37 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  candidate_id VARCHAR(96) NOT NULL,
  rights_status VARCHAR(64) NOT NULL,
  source_authority VARCHAR(64),
  can_public_summary BOOLEAN NOT NULL DEFAULT FALSE,
  can_embed BOOLEAN NOT NULL DEFAULT FALSE,
  can_train_model BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
