-- v19: frontend AI composer + knowledge-base security hardening + true-source claim expansion
-- This migration is additive and keeps v18 endpoints backward-compatible.

CREATE TABLE IF NOT EXISTS kb_access_policies_v19 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  policy_key VARCHAR(128) NOT NULL UNIQUE,
  description_zh TEXT NOT NULL,
  effect ENUM('allow','deny','review') NOT NULL DEFAULT 'deny',
  subject_type VARCHAR(64) NOT NULL,
  resource_type VARCHAR(64) NOT NULL,
  action_key VARCHAR(96) NOT NULL,
  condition_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kb_row_security_rules_v19 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  rule_key VARCHAR(128) NOT NULL UNIQUE,
  table_name VARCHAR(128) NOT NULL,
  visibility_filter JSON NOT NULL,
  blocked_states JSON NOT NULL,
  description_zh TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS source_claim_read_scopes_v19 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  claim_id VARCHAR(128) NOT NULL,
  source_id VARCHAR(128) NOT NULL,
  min_scope VARCHAR(96) NOT NULL DEFAULT 'knowledge:read',
  public_use ENUM('public','public_summary_only','internal_review','restricted') NOT NULL DEFAULT 'public_summary_only',
  sensitivity ENUM('low','medium','high') NOT NULL DEFAULT 'low',
  review_status VARCHAR(96) NOT NULL,
  canonical_fingerprint VARCHAR(96) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_v19_claim_source_scope (claim_id, source_id, min_scope),
  KEY idx_v19_claim_visibility (public_use, sensitivity, review_status)
);

CREATE TABLE IF NOT EXISTS frontend_ai_source_packet_events_v19 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  client_id VARCHAR(128) NULL,
  packet_id VARCHAR(128) NOT NULL,
  action_key ENUM('list','resolve','download','validate') NOT NULL,
  claim_count INT NOT NULL DEFAULT 0,
  request_id VARCHAR(128) NULL,
  ip_hash VARCHAR(128) NULL,
  user_agent_hash VARCHAR(128) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_v19_packet_events (packet_id, action_key, created_at)
);

CREATE TABLE IF NOT EXISTS frontend_ai_draft_submissions_v19 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  draft_id VARCHAR(128) NOT NULL UNIQUE,
  submitted_by_client_id VARCHAR(128) NULL,
  submitted_by_admin_user_id BIGINT NULL,
  title_zh VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  user_idea_summary TEXT NULL,
  claim_ids_json JSON NOT NULL,
  source_ids_json JSON NOT NULL,
  body_sha256 CHAR(64) NOT NULL,
  canonical_fingerprint VARCHAR(96) NOT NULL,
  validation_status ENUM('pending','passed','needs_review','blocked') NOT NULL DEFAULT 'pending',
  review_status ENUM('draft','queued','approved','rejected','published') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  KEY idx_v19_draft_slug (slug),
  KEY idx_v19_draft_fingerprint (canonical_fingerprint),
  KEY idx_v19_draft_status (validation_status, review_status)
);

CREATE TABLE IF NOT EXISTS ai_article_validation_findings_v19 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  draft_id VARCHAR(128) NOT NULL,
  finding_key VARCHAR(128) NOT NULL,
  severity ENUM('info','warning','error','blocker') NOT NULL,
  message_zh TEXT NOT NULL,
  evidence_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_v19_validation_draft (draft_id, severity)
);

CREATE TABLE IF NOT EXISTS api_signature_nonces_v19 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  client_id VARCHAR(128) NOT NULL,
  nonce VARCHAR(128) NOT NULL,
  request_timestamp BIGINT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_v19_client_nonce (client_id, nonce),
  KEY idx_v19_nonce_expiry (expires_at)
);

CREATE TABLE IF NOT EXISTS knowledge_vault_audit_logs_v19 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  actor_type VARCHAR(64) NOT NULL,
  actor_id VARCHAR(128) NULL,
  action_key VARCHAR(128) NOT NULL,
  resource_type VARCHAR(96) NOT NULL,
  resource_id VARCHAR(128) NULL,
  result ENUM('allow','deny','review','error') NOT NULL,
  request_id VARCHAR(128) NULL,
  metadata_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_v19_vault_audit (action_key, result, created_at)
);

CREATE TABLE IF NOT EXISTS content_security_findings_v19 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  content_id VARCHAR(128) NOT NULL,
  content_type VARCHAR(96) NOT NULL,
  rule_key VARCHAR(128) NOT NULL,
  severity ENUM('info','warning','error','blocker') NOT NULL,
  finding_zh TEXT NOT NULL,
  resolution_status ENUM('open','accepted','fixed','false_positive') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  KEY idx_v19_content_findings (content_id, severity, resolution_status)
);

CREATE TABLE IF NOT EXISTS true_source_ingestion_runs_v19 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_id VARCHAR(128) NOT NULL UNIQUE,
  source_id VARCHAR(128) NOT NULL,
  source_url TEXT NOT NULL,
  claims_added INT NOT NULL DEFAULT 0,
  claims_deduped INT NOT NULL DEFAULT 0,
  status ENUM('planned','completed','failed','needs_review') NOT NULL DEFAULT 'planned',
  retrieved_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_v19_source_ingestion (source_id, status)
);
