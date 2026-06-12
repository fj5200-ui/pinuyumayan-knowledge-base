-- v38 folk song deep metadata expansion
CREATE TABLE IF NOT EXISTS music_folk_song_candidates_v38 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  song_id VARCHAR(80) NOT NULL UNIQUE,
  title_zh VARCHAR(255) NOT NULL,
  artist_or_source VARCHAR(255),
  work_type VARCHAR(120),
  rights_status VARCHAR(80) NOT NULL DEFAULT 'unknown_needs_review',
  sensitivity VARCHAR(40) NOT NULL DEFAULT 'low',
  review_status VARCHAR(80) NOT NULL DEFAULT 'candidate_needs_authoritative_review',
  source_ids JSON,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS music_folk_song_review_events_v38 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  song_id VARCHAR(80) NOT NULL,
  reviewer_admin_id BIGINT NULL,
  action VARCHAR(80) NOT NULL,
  rights_status VARCHAR(80),
  sensitivity VARCHAR(40),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS music_folk_song_source_packets_v38 (
  packet_id VARCHAR(80) PRIMARY KEY,
  title_zh VARCHAR(255) NOT NULL,
  claim_ids JSON NOT NULL,
  source_ids JSON NOT NULL,
  guardrails JSON NOT NULL,
  review_status VARCHAR(80) NOT NULL DEFAULT 'candidate_source_packet_needs_review',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS music_folk_song_youtube_metadata_runs_v38 (
  run_id VARCHAR(80) PRIMARY KEY,
  query_text VARCHAR(255) NOT NULL,
  result_count INT NOT NULL DEFAULT 0,
  blocked_count INT NOT NULL DEFAULT 0,
  status VARCHAR(60) NOT NULL DEFAULT 'pending',
  report_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
