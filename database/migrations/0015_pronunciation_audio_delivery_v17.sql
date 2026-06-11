-- v17 pronunciation audio delivery and review layer
CREATE TABLE IF NOT EXISTS puyuma_audio_playback_assets_v17 (
  asset_id VARCHAR(80) PRIMARY KEY,
  entry_id VARCHAR(80) NOT NULL,
  dialect_code VARCHAR(20),
  dialect_zh VARCHAR(80),
  puyuma_form TEXT,
  zh_tw TEXT,
  source_audio_url TEXT NOT NULL,
  proxy_url TEXT NOT NULL,
  mime_type VARCHAR(80) DEFAULT 'audio/mpeg',
  etag_seed VARCHAR(128),
  public_playback_allowed BOOLEAN NOT NULL DEFAULT TRUE,
  review_status VARCHAR(80) DEFAULT 'approved_for_public_learning',
  source_json JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_audio_playback_entry (entry_id),
  INDEX idx_audio_playback_dialect (dialect_code),
  INDEX idx_audio_playback_review (review_status)
);

CREATE TABLE IF NOT EXISTS puyuma_pronunciation_review_tasks_v17 (
  task_id VARCHAR(100) PRIMARY KEY,
  asset_id VARCHAR(80) NOT NULL,
  entry_id VARCHAR(80) NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  review_type VARCHAR(80) NOT NULL,
  status VARCHAR(40) DEFAULT 'queued',
  reason_zh TEXT,
  checks_json JSON,
  reviewer_id VARCHAR(80),
  reviewed_at DATETIME NULL,
  result_json JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pron_review_status (status),
  INDEX idx_pron_review_asset (asset_id)
);

CREATE TABLE IF NOT EXISTS puyuma_audio_proxy_access_logs_v17 (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  asset_id VARCHAR(80) NOT NULL,
  entry_id VARCHAR(80),
  request_id VARCHAR(80),
  client_ip_hash VARCHAR(128),
  user_agent_hash VARCHAR(128),
  response_status INT,
  upstream_status INT,
  cache_status VARCHAR(40),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audio_proxy_asset_time (asset_id, created_at)
);

CREATE TABLE IF NOT EXISTS puyuma_audio_quality_measurements_v17 (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  asset_id VARCHAR(80) NOT NULL,
  measurement_type VARCHAR(80) NOT NULL,
  score DECIMAL(6,4),
  status VARCHAR(40),
  notes_zh TEXT,
  measured_by VARCHAR(80) DEFAULT 'system',
  measured_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audio_quality_asset (asset_id),
  INDEX idx_audio_quality_status (status)
);

CREATE OR REPLACE VIEW vw_public_pronunciation_playback_v17 AS
SELECT asset_id, entry_id, dialect_code, dialect_zh, puyuma_form, zh_tw, source_audio_url, proxy_url, mime_type, review_status
FROM puyuma_audio_playback_assets_v17
WHERE public_playback_allowed = TRUE AND review_status IN ('approved_for_public_learning', 'verified_source_audio');
