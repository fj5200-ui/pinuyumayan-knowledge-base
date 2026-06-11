-- v18: AI article grounding + no-duplicate publication governance
-- This layer lets the main site AI draft articles from verified historical/source claims + admin ideas.
-- It does not allow public auto-publish without citation, duplicate check, and human/cultural review.

CREATE TABLE IF NOT EXISTS knowledge_source_documents_v18 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  source_id VARCHAR(128) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  publisher VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  language VARCHAR(32) NOT NULL,
  source_type VARCHAR(80) NOT NULL,
  trust_level VARCHAR(80) NOT NULL,
  public_use VARCHAR(80) NOT NULL,
  license_note TEXT NULL,
  retrieved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_source_claims_v18 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  claim_id VARCHAR(128) NOT NULL UNIQUE,
  category VARCHAR(80) NOT NULL,
  statement_zh TEXT NOT NULL,
  source_ids JSON NOT NULL,
  evidence_locator VARCHAR(255) NOT NULL,
  confidence VARCHAR(32) NOT NULL,
  sensitivity VARCHAR(32) NOT NULL,
  public_use VARCHAR(80) NOT NULL,
  review_status VARCHAR(80) NOT NULL,
  canonical_fingerprint VARCHAR(128) NOT NULL UNIQUE,
  keywords JSON NULL,
  article_allowed BOOLEAN NOT NULL DEFAULT TRUE,
  article_guardrail TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FULLTEXT INDEX ft_v18_claim_statement (statement_zh)
);

CREATE TABLE IF NOT EXISTS article_idea_inputs_v18 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  idea_id VARCHAR(128) NOT NULL UNIQUE,
  submitted_by VARCHAR(128) NULL,
  title_idea VARCHAR(255) NOT NULL,
  body_idea TEXT NOT NULL,
  target_channel VARCHAR(64) NOT NULL DEFAULT 'main_site',
  status VARCHAR(64) NOT NULL DEFAULT 'received',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_article_draft_plans_v18 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  draft_id VARCHAR(128) NOT NULL UNIQUE,
  idea_id VARCHAR(128) NULL,
  blueprint_id VARCHAR(128) NOT NULL,
  title_zh VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  angle_zh TEXT NOT NULL,
  source_claim_ids JSON NOT NULL,
  user_idea_summary TEXT NULL,
  canonical_fingerprint VARCHAR(128) NOT NULL UNIQUE,
  duplicate_status VARCHAR(64) NOT NULL DEFAULT 'pending',
  review_status VARCHAR(64) NOT NULL DEFAULT 'draft_needs_human_review',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_article_source_citations_v18 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  draft_id VARCHAR(128) NOT NULL,
  claim_id VARCHAR(128) NOT NULL,
  source_id VARCHAR(128) NOT NULL,
  evidence_locator VARCHAR(255) NOT NULL,
  citation_note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_v18_draft_claim_source (draft_id, claim_id, source_id)
);

CREATE TABLE IF NOT EXISTS article_duplicate_fingerprints_v18 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  content_type VARCHAR(64) NOT NULL,
  content_id VARCHAR(128) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  canonical_fingerprint VARCHAR(128) NOT NULL,
  source_claim_set_hash VARCHAR(128) NOT NULL,
  title_hash VARCHAR(128) NOT NULL,
  published_at TIMESTAMP NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'reserved',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_v18_dup_slug (slug),
  UNIQUE KEY uq_v18_dup_fingerprint (canonical_fingerprint),
  INDEX idx_v18_dup_claimset (source_claim_set_hash)
);

CREATE TABLE IF NOT EXISTS article_publish_checks_v18 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  check_id VARCHAR(128) NOT NULL UNIQUE,
  draft_id VARCHAR(128) NOT NULL,
  duplicate_result VARCHAR(64) NOT NULL,
  citation_result VARCHAR(64) NOT NULL,
  sensitivity_result VARCHAR(64) NOT NULL,
  reviewer_required BOOLEAN NOT NULL DEFAULT TRUE,
  blockers JSON NULL,
  warnings JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS article_review_queue_v18 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  review_id VARCHAR(128) NOT NULL UNIQUE,
  draft_id VARCHAR(128) NOT NULL,
  queue_type VARCHAR(64) NOT NULL DEFAULT 'cultural_content_review',
  priority VARCHAR(32) NOT NULL DEFAULT 'normal',
  reason TEXT NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS main_site_ai_publication_policies_v18 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  policy_key VARCHAR(128) NOT NULL UNIQUE,
  policy_json JSON NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_deduplication_events_v18 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_id VARCHAR(128) NOT NULL UNIQUE,
  content_type VARCHAR(64) NOT NULL,
  candidate_slug VARCHAR(255) NOT NULL,
  candidate_fingerprint VARCHAR(128) NOT NULL,
  matched_content_id VARCHAR(128) NULL,
  match_type VARCHAR(80) NOT NULL,
  decision VARCHAR(64) NOT NULL,
  details JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
