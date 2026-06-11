-- 0009_admin_auth_main_site_superadmin.sql
-- Admin login, superadmin bootstrap, and main-site superadmin sync tables.
-- Never store plaintext passwords. Bootstrap via env/secret manager only.

CREATE TABLE IF NOT EXISTS admin_users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  status ENUM('active','disabled','locked','pending_rotation') NOT NULL DEFAULT 'pending_rotation',
  is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_user_roles (
  admin_user_id BIGINT NOT NULL,
  role_key VARCHAR(80) NOT NULL,
  granted_by BIGINT NULL,
  granted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (admin_user_id, role_key),
  INDEX idx_admin_user_roles_role (role_key)
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  admin_user_id BIGINT NOT NULL,
  session_token_hash CHAR(64) NOT NULL UNIQUE,
  request_id VARCHAR(80) NULL,
  ip_hash CHAR(64) NULL,
  user_agent_hash CHAR(64) NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_sessions_user (admin_user_id),
  INDEX idx_admin_sessions_expires (expires_at)
);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  failure_reason VARCHAR(120) NULL,
  ip_hash CHAR(64) NULL,
  user_agent_hash CHAR(64) NULL,
  request_id VARCHAR(80) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_login_email_created (email, created_at)
);

CREATE TABLE IF NOT EXISTS main_site_superadmin_links (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  admin_user_id BIGINT NOT NULL,
  main_site_user_id VARCHAR(120) NULL,
  main_site_email VARCHAR(255) NOT NULL,
  sync_status ENUM('pending','synced','failed','disabled') NOT NULL DEFAULT 'pending',
  last_synced_at DATETIME NULL,
  last_error TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_main_site_email (main_site_email),
  INDEX idx_main_site_sync_status (sync_status)
);

CREATE TABLE IF NOT EXISTS admin_auth_audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  actor_admin_user_id BIGINT NULL,
  action VARCHAR(120) NOT NULL,
  target_type VARCHAR(80) NULL,
  target_id VARCHAR(120) NULL,
  request_id VARCHAR(80) NULL,
  metadata_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_auth_audit_action_created (action, created_at)
);
