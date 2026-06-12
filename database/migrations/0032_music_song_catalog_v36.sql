-- v36 music song catalog and YouTube metadata candidate layer
CREATE TABLE IF NOT EXISTS music_song_catalog_v36 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  song_id VARCHAR(128) NOT NULL UNIQUE,
  title_zh VARCHAR(512) NOT NULL,
  artist_or_source VARCHAR(512),
  work_type VARCHAR(128),
  year_text VARCHAR(64),
  rights_status VARCHAR(128) NOT NULL DEFAULT 'unknown_needs_review',
  review_status VARCHAR(128) NOT NULL DEFAULT 'candidate_needs_review',
  no_lyrics BOOLEAN NOT NULL DEFAULT TRUE,
  no_audio_download BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_youtube_source_candidates_v36 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  query_text VARCHAR(512) NOT NULL,
  video_id VARCHAR(128),
  video_url TEXT,
  title TEXT,
  channel_title VARCHAR(512),
  published_at VARCHAR(64),
  license_status VARCHAR(128) DEFAULT 'unknown_needs_review',
  forbidden_relation_hit BOOLEAN NOT NULL DEFAULT FALSE,
  review_status VARCHAR(128) NOT NULL DEFAULT 'candidate_needs_human_review',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_song_review_events_v36 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  review_id VARCHAR(128) NOT NULL,
  action VARCHAR(64) NOT NULL,
  reviewer VARCHAR(255),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
