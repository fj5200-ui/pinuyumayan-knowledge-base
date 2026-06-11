-- v24 main site runtime bridge, server-side AI composer, HMAC enforcement, review workflow.
CREATE TABLE IF NOT EXISTS main_site_ai_compose_sessions_v24 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  session_id VARCHAR(128) NOT NULL UNIQUE,
  client_id VARCHAR(128) NOT NULL,
  blueprint_id VARCHAR(128) NOT NULL,
  source_packet_hash CHAR(64) NOT NULL,
  user_idea_hash CHAR(64) NOT NULL,
  provider VARCHAR(64) NOT NULL,
  validation_status VARCHAR(64) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS main_site_kb_connection_checks_v24 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  client_id VARCHAR(128) NOT NULL,
  public_ok BOOLEAN NOT NULL DEFAULT FALSE,
  internal_ok BOOLEAN NOT NULL DEFAULT FALSE,
  hmac_ok BOOLEAN NOT NULL DEFAULT FALSE,
  response_ms INT NULL,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS internal_hmac_nonce_failures_v24 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  client_id VARCHAR(128) NULL,
  route_path VARCHAR(255) NOT NULL,
  failure_reason VARCHAR(128) NOT NULL,
  nonce_hash CHAR(64) NULL,
  remote_addr VARCHAR(128) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_article_review_actions_v24 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  draft_id VARCHAR(128) NOT NULL,
  reviewer_id VARCHAR(128) NOT NULL,
  action VARCHAR(64) NOT NULL,
  reason TEXT NULL,
  validation_snapshot_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS article_publish_schedule_v24 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  draft_id VARCHAR(128) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  canonical_fingerprint CHAR(64) NOT NULL,
  publish_at TIMESTAMP NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'scheduled',
  sitemap_included BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS source_candidate_harvest_runs_v24 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  adapter_id VARCHAR(128) NOT NULL,
  status VARCHAR(64) NOT NULL,
  candidate_count INT NOT NULL DEFAULT 0,
  rejected_forbidden_relation_count INT NOT NULL DEFAULT 0,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS source_candidate_claims_v24 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  claim_id VARCHAR(128) NOT NULL UNIQUE,
  source_id VARCHAR(128) NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  canonical_fingerprint CHAR(64) NOT NULL UNIQUE,
  review_status VARCHAR(64) NOT NULL DEFAULT 'candidate_needs_review',
  public_use VARCHAR(64) NOT NULL DEFAULT 'not_public_until_reviewed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS full_corpus_acceptance_reports_v24 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_id VARCHAR(128) NOT NULL UNIQUE,
  entry_count INT NOT NULL DEFAULT 0,
  audio_coverage_percent DECIMAL(5,2) NULL,
  phon_coverage_percent DECIMAL(5,2) NULL,
  dialects_present JSON NULL,
  license_blockers INT NOT NULL DEFAULT 0,
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  report_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seo_publication_checks_v24 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  draft_id VARCHAR(128) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  has_og_metadata BOOLEAN NOT NULL DEFAULT FALSE,
  has_canonical BOOLEAN NOT NULL DEFAULT FALSE,
  has_citations BOOLEAN NOT NULL DEFAULT FALSE,
  forbidden_seo_term_detected BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS main_site_route_install_checks_v24 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  route_path VARCHAR(255) NOT NULL,
  installed BOOLEAN NOT NULL DEFAULT FALSE,
  last_checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
