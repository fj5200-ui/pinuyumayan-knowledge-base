-- 0010_content_delivery_enrichment.sql
-- Website content delivery layer derived from verified facts and approved summaries.

CREATE TABLE IF NOT EXISTS content_items (
  id VARCHAR(120) PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(80) NOT NULL,
  title_zh VARCHAR(255) NOT NULL,
  summary_zh TEXT NULL,
  status ENUM('draft_verified_source','draft_sensitive_review','verified_public','verified_sensitive_summary','approved','archived') NOT NULL DEFAULT 'draft_verified_source',
  visibility ENUM('public','public_summary','public_summary_only','internal_review') NOT NULL DEFAULT 'public_summary',
  release_channel VARCHAR(80) NOT NULL DEFAULT 'preview',
  sensitivity VARCHAR(40) NOT NULL DEFAULT 'low',
  requires_human_review BOOLEAN NOT NULL DEFAULT TRUE,
  source_ids_json JSON NOT NULL,
  related_entity_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_content_items_type_status (type, status),
  INDEX idx_content_items_release (release_channel, visibility)
);

CREATE TABLE IF NOT EXISTS content_item_sections (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  content_item_id VARCHAR(120) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  heading VARCHAR(255) NOT NULL,
  body_zh TEXT NULL,
  items_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_content_sections_item (content_item_id, sort_order)
);

CREATE TABLE IF NOT EXISTS content_collections (
  id VARCHAR(120) PRIMARY KEY,
  name_zh VARCHAR(255) NOT NULL,
  description TEXT NULL,
  release_channel VARCHAR(80) NOT NULL DEFAULT 'preview',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_collection_items (
  collection_id VARCHAR(120) NOT NULL,
  content_item_id VARCHAR(120) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, content_item_id),
  INDEX idx_collection_items_order (collection_id, sort_order)
);

CREATE TABLE IF NOT EXISTS content_publish_queue (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  content_item_id VARCHAR(120) NOT NULL,
  requested_channel VARCHAR(80) NOT NULL,
  status ENUM('queued','blocked','published','failed') NOT NULL DEFAULT 'queued',
  blocker_reason TEXT NULL,
  requested_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_content_publish_queue_status (status, created_at)
);
