-- v14 performance, security, search, and quality optimization layer
-- Designed for MySQL 8 / TiDB compatible deployments.

CREATE TABLE IF NOT EXISTS admin_mfa_factors (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  admin_user_id BIGINT NOT NULL,
  factor_type VARCHAR(32) NOT NULL DEFAULT 'totp',
  secret_ciphertext TEXT NULL,
  recovery_codes_hash TEXT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 0,
  verified_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admin_mfa_user (admin_user_id, enabled)
);

CREATE TABLE IF NOT EXISTS admin_password_reset_tokens (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  admin_user_id BIGINT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_ip VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_admin_reset_token_hash (token_hash),
  INDEX idx_admin_reset_user (admin_user_id, expires_at)
);

CREATE TABLE IF NOT EXISTS api_scope_policies (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  scope VARCHAR(96) NOT NULL,
  description TEXT NULL,
  public_exposable TINYINT(1) NOT NULL DEFAULT 0,
  requires_internal_key TINYINT(1) NOT NULL DEFAULT 1,
  requires_admin_session TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_api_scope_policy_scope (scope)
);

CREATE TABLE IF NOT EXISTS search_synonyms (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  term VARCHAR(255) NOT NULL,
  alias VARCHAR(255) NOT NULL,
  locale VARCHAR(16) NOT NULL DEFAULT 'zh-TW',
  rule_note TEXT NULL,
  approved TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_search_synonym (term, alias, locale),
  INDEX idx_search_synonyms_term (term)
);

CREATE TABLE IF NOT EXISTS search_query_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  request_id VARCHAR(64) NULL,
  client_id BIGINT NULL,
  query_text VARCHAR(512) NOT NULL,
  filters_json JSON NULL,
  result_count INT NOT NULL DEFAULT 0,
  latency_ms INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_search_query_logs_created (created_at),
  INDEX idx_search_query_logs_query (query_text)
);

CREATE TABLE IF NOT EXISTS cache_invalidation_jobs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  target VARCHAR(128) NOT NULL,
  release_channel VARCHAR(64) NULL,
  reason VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'queued',
  requested_by VARCHAR(255) NULL,
  processed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cache_invalidation_status (status, created_at)
);

CREATE TABLE IF NOT EXISTS corpus_import_retry_queue (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  import_run_id BIGINT NULL,
  source_path TEXT NOT NULL,
  source_format VARCHAR(16) NOT NULL,
  error_code VARCHAR(96) NULL,
  error_message TEXT NULL,
  attempt_count INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  next_attempt_at DATETIME NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'queued',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_corpus_retry_status (status, next_attempt_at)
);

CREATE TABLE IF NOT EXISTS content_moderation_rules (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  rule_key VARCHAR(128) NOT NULL,
  rule_type VARCHAR(64) NOT NULL,
  severity VARCHAR(32) NOT NULL DEFAULT 'warning',
  pattern TEXT NULL,
  action VARCHAR(64) NOT NULL DEFAULT 'flag_for_review',
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_content_moderation_rule_key (rule_key)
);

CREATE TABLE IF NOT EXISTS materialized_public_payloads_v14 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  payload_key VARCHAR(128) NOT NULL,
  release_channel VARCHAR(64) NOT NULL DEFAULT 'public',
  payload_json JSON NOT NULL,
  etag VARCHAR(128) NOT NULL,
  source_hash VARCHAR(128) NULL,
  expires_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_materialized_public_payload (payload_key, release_channel),
  INDEX idx_materialized_payload_expires (expires_at)
);

CREATE TABLE IF NOT EXISTS data_quality_gate_results_v14 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  gate_key VARCHAR(128) NOT NULL,
  release_channel VARCHAR(64) NULL,
  target_type VARCHAR(64) NOT NULL,
  target_id VARCHAR(128) NULL,
  severity VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL,
  finding_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_quality_gate_results (gate_key, status, severity, created_at)
);

INSERT IGNORE INTO api_scope_policies (scope, description, public_exposable, requires_internal_key, requires_admin_session) VALUES
('knowledge:read','Read public-safe knowledge payloads',1,0,0),
('vocabulary:read','Read public-safe vocabulary/audio entries',1,0,0),
('content:read','Read public-safe content collections and items',1,0,0),
('cache:invalidate','Invalidate materialized public payloads',0,1,0),
('quality:run','Run data quality gates',0,1,1),
('admin:security','Manage admin security settings and sessions',0,0,1);

INSERT IGNORE INTO search_synonyms (term, alias, locale, rule_note, approved) VALUES
('卑南族','Pinuyumayan','zh-TW','Whole people preferred term',1),
('南王','Nanwang_Puyuma','zh-TW','Dialect/source label',1),
('知本','Zhiben_Puyuma','zh-TW','Dialect/source label',1),
('西群','Xiqun_Puyuma','zh-TW','Dialect/source label',1),
('建和','Jianhe_Puyuma','zh-TW','Dialect/source label',1);

INSERT IGNORE INTO content_moderation_rules (rule_key, rule_type, severity, pattern, action) VALUES
('no_private_ritual_procedure','sensitive_content','blocking','祭儀流程|禁忌細節|操作步驟','block_public_release'),
('no_unverified_date_claim','fact_check','warning','確切日期|每年固定','flag_for_review'),
('no_plaintext_secret','security','critical','password|secret|api_key','block_public_release');
