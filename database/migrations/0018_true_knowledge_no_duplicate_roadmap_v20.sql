-- 0018_true_knowledge_no_duplicate_roadmap_v20.sql
-- v20: true knowledge collection, frontend AI source packets, and no-duplicate article memory.

CREATE TABLE IF NOT EXISTS true_source_registry_v20 (
  source_id VARCHAR(160) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  publisher VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  language VARCHAR(20) NOT NULL,
  source_type VARCHAR(80) NOT NULL,
  trust_level VARCHAR(80) NOT NULL,
  evidence_range VARCHAR(80),
  captured_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS source_grounded_claims_v20 (
  claim_id VARCHAR(160) PRIMARY KEY,
  category VARCHAR(120) NOT NULL,
  statement_zh TEXT NOT NULL,
  source_ids JSON NOT NULL,
  evidence_locator VARCHAR(120) NOT NULL,
  confidence VARCHAR(40) NOT NULL,
  sensitivity VARCHAR(40) NOT NULL,
  public_use VARCHAR(80) NOT NULL,
  review_status VARCHAR(80) NOT NULL,
  canonical_fingerprint VARCHAR(80) NOT NULL UNIQUE,
  article_allowed BOOLEAN DEFAULT TRUE,
  article_guardrail TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS frontend_ai_source_packets_v20 (
  packet_id VARCHAR(160) PRIMARY KEY,
  title_zh VARCHAR(255) NOT NULL,
  claim_ids JSON NOT NULL,
  allowed_article_angles JSON NOT NULL,
  required_user_idea_slots JSON NOT NULL,
  forbidden JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS article_no_duplicate_memory_v20 (
  memory_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  canonical_fingerprint VARCHAR(80) NOT NULL,
  claim_set_hash VARCHAR(80),
  slug VARCHAR(255),
  topic_key VARCHAR(160),
  source_packet_id VARCHAR(160),
  action VARCHAR(40) DEFAULT 'track',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_v20_fingerprint (canonical_fingerprint),
  KEY idx_v20_topic (topic_key),
  KEY idx_v20_slug (slug)
);

CREATE TABLE IF NOT EXISTS knowledge_collection_runs_v20 (
  run_id VARCHAR(160) PRIMARY KEY,
  source_ids JSON NOT NULL,
  new_claim_count INT NOT NULL DEFAULT 0,
  duplicate_blocked_count INT NOT NULL DEFAULT 0,
  high_sensitivity_count INT NOT NULL DEFAULT 0,
  status VARCHAR(40) NOT NULL DEFAULT 'completed',
  report_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
