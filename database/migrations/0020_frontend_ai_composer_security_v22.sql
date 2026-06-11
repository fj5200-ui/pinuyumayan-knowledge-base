-- v22 frontend AI composer implementation, HMAC nonce security, source candidates and review dashboard
CREATE TABLE IF NOT EXISTS frontend_ai_provider_configs_v22 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  provider_id VARCHAR(96) NOT NULL UNIQUE,
  display_name VARCHAR(160) NOT NULL,
  runtime_scope VARCHAR(64) NOT NULL,
  secret_policy VARCHAR(128) NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS frontend_ai_composer_sessions_v22 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  session_id VARCHAR(128) NOT NULL UNIQUE,
  user_id VARCHAR(128) NULL,
  blueprint_id VARCHAR(128) NOT NULL,
  selected_claim_hash CHAR(64) NOT NULL,
  selected_source_hash CHAR(64) NOT NULL,
  provider_id VARCHAR(96) NOT NULL,
  draft_fingerprint CHAR(64) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'started',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS frontend_ai_draft_validations_v22 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  draft_id VARCHAR(128) NOT NULL,
  draft_fingerprint CHAR(64) NOT NULL,
  citation_status VARCHAR(48) NOT NULL,
  duplicate_status VARCHAR(48) NOT NULL,
  forbidden_relation_status VARCHAR(48) NOT NULL,
  sensitivity_status VARCHAR(48) NOT NULL,
  publish_decision VARCHAR(48) NOT NULL,
  findings_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_source_candidate_adapters_v22 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  adapter_id VARCHAR(128) NOT NULL UNIQUE,
  display_name VARCHAR(180) NOT NULL,
  source_type VARCHAR(80) NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'candidate_only',
  auto_publish_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  requires_manual_verification BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_ingestion_candidates_v22 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  adapter_id VARCHAR(128) NOT NULL,
  candidate_id VARCHAR(160) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  url TEXT NULL,
  publisher VARCHAR(180) NULL,
  candidate_hash CHAR(64) NOT NULL,
  forbidden_relation_status VARCHAR(48) NOT NULL DEFAULT 'not_checked',
  license_status VARCHAR(48) NOT NULL DEFAULT 'not_checked',
  review_status VARCHAR(48) NOT NULL DEFAULT 'candidate_needs_review',
  raw_metadata_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hmac_nonce_cache_v22 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  client_id VARCHAR(128) NOT NULL,
  nonce VARCHAR(160) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_hmac_nonce_client_nonce_v22 (client_id, nonce)
);

CREATE TABLE IF NOT EXISTS internal_api_signature_audit_v22 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  client_id VARCHAR(128) NULL,
  request_path VARCHAR(255) NOT NULL,
  request_method VARCHAR(16) NOT NULL,
  nonce VARCHAR(160) NULL,
  decision VARCHAR(48) NOT NULL,
  failure_reason VARCHAR(160) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS article_cooldown_windows_v22 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  topic_key VARCHAR(160) NOT NULL,
  blueprint_id VARCHAR(128) NULL,
  cooldown_until TIMESTAMP NOT NULL,
  reason VARCHAR(160) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS article_fingerprint_dashboard_v22 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  draft_or_article_id VARCHAR(128) NOT NULL,
  title_hash CHAR(64) NOT NULL,
  claim_set_hash CHAR(64) NOT NULL,
  source_set_hash CHAR(64) NOT NULL,
  topic_key VARCHAR(160) NOT NULL,
  duplicate_decision VARCHAR(48) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forbidden_relation_hits_v22 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  target_type VARCHAR(64) NOT NULL,
  target_id VARCHAR(128) NOT NULL,
  term VARCHAR(160) NOT NULL,
  context_snippet TEXT NULL,
  action VARCHAR(64) NOT NULL DEFAULT 'block',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS full_corpus_import_reports_v22 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_id VARCHAR(128) NOT NULL UNIQUE,
  status VARCHAR(64) NOT NULL,
  target_min_entries INT NOT NULL DEFAULT 1000,
  total_entries INT NULL,
  audio_url_coverage DECIMAL(5,2) NULL,
  source_phon_coverage DECIMAL(5,2) NULL,
  duplicate_count INT NULL,
  blocked_license_count INT NULL,
  report_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_article_review_actions_v22 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  draft_id VARCHAR(128) NOT NULL,
  reviewer_id VARCHAR(128) NOT NULL,
  action VARCHAR(64) NOT NULL,
  reason TEXT NULL,
  audit_payload_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
