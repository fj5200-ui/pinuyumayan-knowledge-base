-- v21 True Knowledge + Forbidden Relation Governance
CREATE TABLE IF NOT EXISTS true_knowledge_sources_v21 (
  source_id VARCHAR(160) PRIMARY KEY,
  title_zh VARCHAR(255) NOT NULL,
  publisher VARCHAR(160) NOT NULL,
  url TEXT NULL,
  source_type VARCHAR(80) NOT NULL,
  reliability VARCHAR(80) NOT NULL,
  allowed_use VARCHAR(120) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS source_grounded_claims_v21 (
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
  dedupe_key VARCHAR(80) NOT NULL UNIQUE,
  article_allowed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forbidden_knowledge_relations_v21 (
  rule_id VARCHAR(160) PRIMARY KEY,
  blocked_term VARCHAR(255) NOT NULL,
  blocked_relation_type VARCHAR(120) NOT NULL,
  action VARCHAR(80) NOT NULL,
  message_zh TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(blocked_term, blocked_relation_type)
);

CREATE TABLE IF NOT EXISTS frontend_ai_source_packets_v21 (
  packet_id VARCHAR(160) PRIMARY KEY,
  title_zh VARCHAR(255) NOT NULL,
  claim_ids JSON NOT NULL,
  allowed_article_angles JSON NOT NULL,
  forbidden JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS article_blocked_relation_findings_v21 (
  finding_id VARCHAR(160) PRIMARY KEY,
  draft_id VARCHAR(160) NOT NULL,
  blocked_term VARCHAR(255) NOT NULL,
  relation_type VARCHAR(120) NOT NULL,
  severity VARCHAR(40) NOT NULL,
  action VARCHAR(80) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
