-- v34 expanded true knowledge and source search candidate intake
CREATE TABLE IF NOT EXISTS source_search_runs_v34 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_key VARCHAR(128) NOT NULL UNIQUE,
  source_class VARCHAR(128) NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'created',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS source_search_candidates_v34 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  candidate_id VARCHAR(128) NOT NULL UNIQUE,
  source_id VARCHAR(128) NOT NULL,
  title VARCHAR(512) NOT NULL,
  source_class VARCHAR(128) NOT NULL,
  public_use VARCHAR(64) NOT NULL DEFAULT 'candidate_only_not_public',
  review_status VARCHAR(64) NOT NULL DEFAULT 'candidate_needs_fetch_and_human_review',
  forbidden_relation_checked BOOLEAN NOT NULL DEFAULT FALSE,
  license_status VARCHAR(128) DEFAULT 'unknown_pending_review',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS source_candidate_findings_v34 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  candidate_id VARCHAR(128) NOT NULL,
  finding_type VARCHAR(128) NOT NULL,
  finding_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS true_knowledge_claims_v34 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  claim_id VARCHAR(128) NOT NULL UNIQUE,
  category VARCHAR(128) NOT NULL,
  statement_zh TEXT NOT NULL,
  source_ids JSON NOT NULL,
  canonical_fingerprint VARCHAR(128) NOT NULL UNIQUE,
  public_use VARCHAR(64) NOT NULL,
  review_status VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS source_ingestion_review_queue_v34 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  queue_key VARCHAR(128) NOT NULL UNIQUE,
  source_id VARCHAR(128) NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'pending_review',
  assigned_to VARCHAR(128) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
