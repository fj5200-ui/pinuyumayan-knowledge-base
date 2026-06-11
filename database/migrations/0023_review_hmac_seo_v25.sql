-- v25 Main-site deployable review / HMAC / SEO governance
CREATE TABLE IF NOT EXISTS article_review_events_v25 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  draft_id VARCHAR(128) NOT NULL,
  actor_id VARCHAR(128) NOT NULL,
  actor_role VARCHAR(64) NOT NULL,
  action VARCHAR(64) NOT NULL,
  previous_state VARCHAR(64),
  next_state VARCHAR(64) NOT NULL,
  reason TEXT,
  request_id VARCHAR(128),
  ip_hash VARCHAR(128),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_article_review_events_v25_draft (draft_id),
  INDEX idx_article_review_events_v25_action (action),
  INDEX idx_article_review_events_v25_created (created_at)
);

CREATE TABLE IF NOT EXISTS internal_hmac_failures_v25 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  client_id VARCHAR(128),
  route_path VARCHAR(255) NOT NULL,
  method VARCHAR(16) NOT NULL,
  failure_code VARCHAR(64) NOT NULL,
  nonce_hash VARCHAR(128),
  timestamp_seen VARCHAR(64),
  request_id VARCHAR(128),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_internal_hmac_failures_v25_client (client_id),
  INDEX idx_internal_hmac_failures_v25_route (route_path),
  INDEX idx_internal_hmac_failures_v25_created (created_at)
);

CREATE TABLE IF NOT EXISTS internal_hmac_nonces_v25 (
  nonce_hash VARCHAR(128) PRIMARY KEY,
  client_id VARCHAR(128) NOT NULL,
  first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_internal_hmac_nonces_v25_client (client_id),
  INDEX idx_internal_hmac_nonces_v25_expires (expires_at)
);

CREATE TABLE IF NOT EXISTS article_seo_publish_checks_v25 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  draft_id VARCHAR(128) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  canonical_url VARCHAR(512),
  title_length INT,
  description_length INT,
  og_image_status VARCHAR(64),
  sitemap_status VARCHAR(64),
  cooldown_status VARCHAR(64),
  duplicate_status VARCHAR(64),
  forbidden_relation_status VARCHAR(64),
  passed BOOLEAN DEFAULT FALSE,
  findings_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_article_seo_publish_checks_v25_draft (draft_id),
  INDEX idx_article_seo_publish_checks_v25_slug (slug),
  INDEX idx_article_seo_publish_checks_v25_passed (passed)
);

CREATE TABLE IF NOT EXISTS full_corpus_acceptance_reports_v25 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  import_run_id VARCHAR(128) NOT NULL,
  entry_count INT NOT NULL,
  dialect_distribution_json JSON,
  audio_coverage_percent DECIMAL(5,2),
  phon_coverage_percent DECIMAL(5,2),
  duplicate_count INT DEFAULT 0,
  blocked_license_count INT DEFAULT 0,
  public_release_recommendation VARCHAR(64) NOT NULL,
  report_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_full_corpus_acceptance_reports_v25_run (import_run_id),
  INDEX idx_full_corpus_acceptance_reports_v25_recommendation (public_release_recommendation)
);

CREATE TABLE IF NOT EXISTS source_candidate_adapter_runs_v25 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  adapter_id VARCHAR(128) NOT NULL,
  status VARCHAR(64) NOT NULL,
  candidate_count INT DEFAULT 0,
  rejected_forbidden_relation_count INT DEFAULT 0,
  deduped_count INT DEFAULT 0,
  findings_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_source_candidate_adapter_runs_v25_adapter (adapter_id),
  INDEX idx_source_candidate_adapter_runs_v25_status (status)
);
