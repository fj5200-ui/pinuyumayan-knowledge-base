-- v33 expanded source search and knowledge intake
CREATE TABLE IF NOT EXISTS source_search_runs_v33 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_key VARCHAR(128) NOT NULL UNIQUE,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  query_count INT NOT NULL DEFAULT 0,
  candidate_count INT NOT NULL DEFAULT 0,
  started_at DATETIME NULL,
  finished_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS source_search_candidates_v33 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  source_id VARCHAR(128) NOT NULL UNIQUE,
  title VARCHAR(512) NOT NULL,
  url TEXT NOT NULL,
  publisher VARCHAR(255) NULL,
  source_class VARCHAR(128) NOT NULL,
  review_status VARCHAR(64) NOT NULL DEFAULT 'pending_human_review',
  public_use VARCHAR(64) NOT NULL DEFAULT 'candidate_only_not_public',
  forbidden_relation_checked TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS source_candidate_findings_v33 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  candidate_source_id VARCHAR(128) NOT NULL,
  finding_type VARCHAR(64) NOT NULL,
  finding_text TEXT NOT NULL,
  severity VARCHAR(32) NOT NULL DEFAULT 'info',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_candidate_source_id (candidate_source_id)
);

CREATE TABLE IF NOT EXISTS source_ingestion_review_queue_v33 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  review_id VARCHAR(160) NOT NULL UNIQUE,
  source_id VARCHAR(128) NOT NULL,
  review_status VARCHAR(64) NOT NULL DEFAULT 'pending_human_review',
  required_checks JSON NULL,
  reviewer_note TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS true_knowledge_claims_v33 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  claim_id VARCHAR(160) NOT NULL UNIQUE,
  category VARCHAR(128) NOT NULL,
  statement_zh TEXT NOT NULL,
  source_ids JSON NOT NULL,
  evidence_locator VARCHAR(128) NULL,
  confidence VARCHAR(64) NOT NULL,
  sensitivity VARCHAR(64) NOT NULL,
  public_use VARCHAR(64) NOT NULL,
  review_status VARCHAR(64) NOT NULL,
  canonical_fingerprint VARCHAR(128) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forbidden_relation_audit_v33 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  input_text_hash VARCHAR(128) NOT NULL,
  matched_terms JSON NOT NULL,
  action VARCHAR(64) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
