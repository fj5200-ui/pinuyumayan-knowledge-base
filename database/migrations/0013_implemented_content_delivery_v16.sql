-- v16 implemented content delivery tables. MySQL/TiDB compatible.
CREATE TABLE IF NOT EXISTS public_knowledge_cards_v16 (
  id varchar(80) PRIMARY KEY,
  slug varchar(255) NOT NULL UNIQUE,
  entity_type varchar(64) NOT NULL,
  entity_id varchar(128) NOT NULL,
  title_zh varchar(255) NOT NULL,
  summary_zh text,
  body_zh mediumtext,
  keywords_json json,
  source_ids_json json,
  release_channel varchar(64) NOT NULL DEFAULT 'public',
  review_status varchar(80) NOT NULL,
  sensitivity varchar(32) NOT NULL DEFAULT 'low',
  sort_order int NOT NULL DEFAULT 0,
  sections_json json,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_public_cards_entity (entity_type, entity_id),
  KEY idx_public_cards_channel (release_channel, review_status),
  FULLTEXT KEY ft_public_cards_zh (title_zh, summary_zh, body_zh)
);

CREATE TABLE IF NOT EXISTS public_content_collections_v16 (
  id varchar(80) PRIMARY KEY,
  slug varchar(255) NOT NULL UNIQUE,
  title_zh varchar(255) NOT NULL,
  description_zh text,
  item_slugs_json json NOT NULL,
  release_channel varchar(64) NOT NULL DEFAULT 'public',
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_public_collections_channel (release_channel)
);

CREATE TABLE IF NOT EXISTS public_search_documents_v16 (
  id varchar(80) PRIMARY KEY,
  entity_type varchar(64) NOT NULL,
  entity_id varchar(128) NOT NULL,
  slug varchar(255) NOT NULL,
  title_zh varchar(255) NOT NULL,
  body_zh mediumtext,
  keywords_json json,
  release_channel varchar(64) NOT NULL DEFAULT 'public',
  source_ids_json json,
  weight int NOT NULL DEFAULT 0,
  updated_at timestamp NULL,
  KEY idx_public_search_entity (entity_type, entity_id),
  KEY idx_public_search_channel_weight (release_channel, weight),
  FULLTEXT KEY ft_public_search_zh (title_zh, body_zh)
);

CREATE TABLE IF NOT EXISTS vocabulary_learning_sets_v16 (
  id varchar(80) PRIMARY KEY,
  set_type varchar(64) NOT NULL,
  title_zh varchar(255) NOT NULL,
  description_zh text,
  entry_ids_json json NOT NULL,
  entry_count int NOT NULL DEFAULT 0,
  source_scope varchar(64) NOT NULL DEFAULT 'preview_subset',
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_vocab_learning_scope (source_scope, set_type)
);

CREATE OR REPLACE VIEW vw_public_content_cards_v16 AS
SELECT id, slug, entity_type, entity_id, title_zh, summary_zh, body_zh, keywords_json, source_ids_json, release_channel, review_status, sensitivity, sort_order, sections_json, updated_at
FROM public_knowledge_cards_v16
WHERE release_channel = 'public' AND sensitivity IN ('low','medium') AND review_status NOT LIKE 'rejected%';

CREATE OR REPLACE VIEW vw_public_search_documents_v16 AS
SELECT id, entity_type, entity_id, slug, title_zh, body_zh, keywords_json, source_ids_json, weight, updated_at
FROM public_search_documents_v16
WHERE release_channel = 'public';
