-- v23 Main Site Connection Runtime

CREATE TABLE IF NOT EXISTS main_site_connection_clients_v23 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  client_id VARCHAR(128) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  site_url VARCHAR(512) NOT NULL,
  environment VARCHAR(32) NOT NULL DEFAULT 'production',
  api_key_hash VARCHAR(255) NULL,
  hmac_secret_hash VARCHAR(255) NULL,
  hmac_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  allowed_origins JSON NOT NULL,
  allowed_scopes JSON NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS main_site_connection_checks_v23 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  client_id VARCHAR(128) NOT NULL,
  check_name VARCHAR(128) NOT NULL,
  result_status VARCHAR(32) NOT NULL,
  latency_ms INT NULL,
  error_message TEXT NULL,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_mscc_client_checked (client_id, checked_at)
);

CREATE TABLE IF NOT EXISTS main_site_ai_compose_events_v23 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  client_id VARCHAR(128) NOT NULL,
  blueprint_id VARCHAR(128) NULL,
  source_packet_hash VARCHAR(128) NULL,
  user_idea_hash VARCHAR(128) NULL,
  provider VARCHAR(64) NOT NULL,
  validation_status VARCHAR(64) NOT NULL DEFAULT 'pending_validation',
  duplicate_status VARCHAR(64) NULL,
  forbidden_relation_status VARCHAR(64) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_msace_client_created (client_id, created_at)
);

CREATE TABLE IF NOT EXISTS main_site_secret_rotation_events_v23 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  client_id VARCHAR(128) NOT NULL,
  secret_type VARCHAR(64) NOT NULL,
  old_key_fingerprint VARCHAR(128) NULL,
  new_key_fingerprint VARCHAR(128) NOT NULL,
  rotation_status VARCHAR(32) NOT NULL DEFAULT 'scheduled',
  overlap_until TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
