-- 0023_vps_db_production_core_v26.sql
-- v26: VPS database production core implementation.
-- Assumption: primary MySQL/MariaDB database runs on user's VPS or private VPS LAN.

CREATE TABLE IF NOT EXISTS vps_database_instances_v26 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  instance_key VARCHAR(80) NOT NULL UNIQUE,
  engine ENUM('mysql8','mariadb10_11','tidb_mysql_compatible','other') NOT NULL DEFAULT 'mysql8',
  host_label VARCHAR(160) NOT NULL,
  database_name VARCHAR(120) NOT NULL,
  network_scope ENUM('localhost','private_lan','vpn','public_forbidden') NOT NULL DEFAULT 'localhost',
  backup_policy_key VARCHAR(120) NOT NULL DEFAULT 'daily_logical_backup',
  status ENUM('planned','active','maintenance','disabled') NOT NULL DEFAULT 'planned',
  metadata_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vps_database_backups_v26 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  backup_key VARCHAR(120) NOT NULL UNIQUE,
  instance_key VARCHAR(80) NOT NULL,
  backup_type ENUM('logical_mysqldump','physical_snapshot','manual_export') NOT NULL DEFAULT 'logical_mysqldump',
  storage_uri TEXT NOT NULL,
  sha256 CHAR(64) NULL,
  size_bytes BIGINT NULL,
  status ENUM('started','completed','failed','expired') NOT NULL DEFAULT 'started',
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  metadata_json JSON NULL,
  INDEX idx_vps_backup_instance_started (instance_key, started_at)
);

CREATE TABLE IF NOT EXISTS vps_migration_runs_v26 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  migration_file VARCHAR(255) NOT NULL,
  checksum_sha256 CHAR(64) NULL,
  status ENUM('started','applied','failed','rolled_back') NOT NULL DEFAULT 'started',
  applied_by VARCHAR(160) NULL,
  error_text TEXT NULL,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at DATETIME NULL,
  UNIQUE KEY uq_vps_migration_file (migration_file)
);

CREATE TABLE IF NOT EXISTS internal_api_nonces_v26 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  client_id VARCHAR(120) NOT NULL,
  nonce VARCHAR(160) NOT NULL,
  request_timestamp_ms BIGINT NOT NULL,
  request_path VARCHAR(512) NOT NULL,
  request_method VARCHAR(16) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_internal_nonce_client_nonce (client_id, nonce),
  INDEX idx_internal_nonce_expires (expires_at)
);

CREATE TABLE IF NOT EXISTS internal_hmac_failures_v26 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  client_id VARCHAR(120) NULL,
  failure_code VARCHAR(80) NOT NULL,
  request_path VARCHAR(512) NOT NULL,
  request_method VARCHAR(16) NOT NULL,
  ip_hash CHAR(64) NULL,
  user_agent_hash CHAR(64) NULL,
  request_id VARCHAR(80) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_hmac_failures_created (created_at),
  INDEX idx_hmac_failures_client_created (client_id, created_at)
);

CREATE TABLE IF NOT EXISTS article_review_transactions_v26 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  draft_id VARCHAR(120) NOT NULL,
  action ENUM('approve','reject','request_revision','schedule','cancel_schedule','archive','merge_duplicate') NOT NULL,
  previous_state VARCHAR(80) NULL,
  next_state VARCHAR(80) NOT NULL,
  reviewer_admin_user_id BIGINT NULL,
  reason TEXT NULL,
  publish_at DATETIME NULL,
  checks_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_article_review_draft_created (draft_id, created_at),
  INDEX idx_article_review_action_created (action, created_at)
);

CREATE TABLE IF NOT EXISTS article_review_audit_v26 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  draft_id VARCHAR(120) NOT NULL,
  event_type VARCHAR(120) NOT NULL,
  actor_admin_user_id BIGINT NULL,
  metadata_json JSON NULL,
  request_id VARCHAR(80) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_article_review_audit_draft_created (draft_id, created_at)
);

CREATE TABLE IF NOT EXISTS main_site_connection_checks_v26 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  check_key VARCHAR(120) NOT NULL,
  target_url TEXT NOT NULL,
  status ENUM('ok','warning','failed') NOT NULL,
  latency_ms INT NULL,
  detail_json JSON NULL,
  checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_main_site_connection_checked (checked_at)
);

CREATE TABLE IF NOT EXISTS full_corpus_acceptance_reports_v26 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  report_key VARCHAR(120) NOT NULL UNIQUE,
  min_entries_required INT NOT NULL DEFAULT 1000,
  total_entries INT NOT NULL DEFAULT 0,
  dialect_count_json JSON NULL,
  audio_coverage_ratio DECIMAL(6,4) NULL,
  source_phon_coverage_ratio DECIMAL(6,4) NULL,
  license_blocker_count INT NOT NULL DEFAULT 0,
  duplicate_count INT NOT NULL DEFAULT 0,
  public_candidate_count INT NOT NULL DEFAULT 0,
  report_json JSON NULL,
  status ENUM('pending','passed','failed','manual_review') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_source_candidates_v26 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  candidate_key VARCHAR(160) NOT NULL UNIQUE,
  source_title VARCHAR(255) NOT NULL,
  source_url TEXT NOT NULL,
  publisher VARCHAR(160) NULL,
  adapter_key VARCHAR(120) NOT NULL,
  review_status ENUM('candidate_needs_human_review','approved','rejected','blocked_forbidden_relation') NOT NULL DEFAULT 'candidate_needs_human_review',
  reason TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forbidden_relation_hits_v26 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  object_type VARCHAR(80) NOT NULL,
  object_id VARCHAR(120) NOT NULL,
  term VARCHAR(160) NOT NULL,
  context ENUM('source_candidate','ai_draft','search_synonym','related_content','admin_review') NOT NULL,
  action ENUM('blocked','manual_review','negative_disambiguation_allowed') NOT NULL DEFAULT 'blocked',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_forbidden_relation_object (object_type, object_id)
);

INSERT IGNORE INTO vps_database_instances_v26 (instance_key, engine, host_label, database_name, network_scope, status, metadata_json)
VALUES ('primary-vps-db', 'mysql8', 'user-vps-localhost', 'pinuyumayan_kb', 'localhost', 'planned', JSON_OBJECT('note','Configure DATABASE_URL on VPS; do not expose 3306 publicly.'));
