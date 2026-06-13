-- v44 true speech authorization review, MySQL FULLTEXT music search, export and candidate workflow
CREATE TABLE IF NOT EXISTS speech_asset_authorization_v44 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  asset_id VARCHAR(128) NOT NULL,
  entry_id VARCHAR(128),
  source_audio_url TEXT,
  source_id VARCHAR(190),
  source_path TEXT,
  source_license VARCHAR(128) NOT NULL DEFAULT 'unknown_pending_rights_review',
  license_evidence_url TEXT,
  commercial_use_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  speaker_id_or_anonymous_code VARCHAR(190),
  speaker_consent_status VARCHAR(128) NOT NULL DEFAULT 'not_documented_requires_review',
  dialect_code VARCHAR(64),
  dialect_zh VARCHAR(128),
  transcript_text TEXT,
  phon TEXT,
  ipa TEXT,
  alignment_status VARCHAR(128) NOT NULL DEFAULT 'needs_forced_alignment_review',
  alignment_score DECIMAL(8,4),
  review_status VARCHAR(128) NOT NULL DEFAULT 'blocked_until_license_consent_alignment',
  allowed_for_train_export BOOLEAN NOT NULL DEFAULT FALSE,
  allowed_for_dev_export BOOLEAN NOT NULL DEFAULT FALSE,
  allowed_for_test_export BOOLEAN NOT NULL DEFAULT FALSE,
  blocked_reasons_json JSON,
  required_next_actions_json JSON,
  reviewer VARCHAR(190),
  review_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_asset_authorization_v44_asset (asset_id),
  KEY idx_speech_asset_authorization_v44_status (review_status),
  KEY idx_speech_asset_authorization_v44_dialect (dialect_code)
);

CREATE TABLE IF NOT EXISTS speech_dataset_exports_v44 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  export_id VARCHAR(128) NOT NULL,
  export_version VARCHAR(64) NOT NULL DEFAULT 'v44',
  train_count INT NOT NULL DEFAULT 0,
  dev_count INT NOT NULL DEFAULT 0,
  test_count INT NOT NULL DEFAULT 0,
  blocked_count INT NOT NULL DEFAULT 0,
  public_release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  export_paths_json JSON,
  report_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_dataset_exports_v44_export (export_id)
);

CREATE TABLE IF NOT EXISTS speech_model_cards_v44 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  model_card_id VARCHAR(128) NOT NULL,
  dataset_export_id VARCHAR(128),
  model_type VARCHAR(32) NOT NULL,
  model_version VARCHAR(128),
  public_release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  mos DECIMAL(8,4),
  wer DECIMAL(8,4),
  cer DECIMAL(8,4),
  review_status VARCHAR(128) NOT NULL DEFAULT 'experiment_only',
  model_card_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_model_cards_v44_card (model_card_id)
);

CREATE TABLE IF NOT EXISTS music_search_documents_v43 (
  id VARCHAR(128) PRIMARY KEY,
  title VARCHAR(512) NOT NULL,
  artist VARCHAR(255),
  community VARCHAR(255),
  work_type VARCHAR(160),
  summary TEXT,
  source_title VARCHAR(512),
  source_url TEXT,
  rights_status VARCHAR(128) NOT NULL DEFAULT 'metadata_only_review_required',
  sensitivity VARCHAR(128) NOT NULL DEFAULT 'low',
  source_authority VARCHAR(190),
  youtube_official_status VARCHAR(128) NOT NULL DEFAULT 'not_youtube_audio',
  romanized_terms TEXT,
  body TEXT,
  facets_json JSON,
  claim_ids_json JSON,
  source_ids_json JSON,
  review_status VARCHAR(128) NOT NULL DEFAULT 'candidate_summary_public',
  public_visible BOOLEAN NOT NULL DEFAULT TRUE,
  doc_hash VARCHAR(128),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT KEY ft_music_search_v43 (title, artist, community, work_type, summary, source_title, romanized_terms, body),
  KEY idx_music_search_documents_v43_public (public_visible, review_status),
  KEY idx_music_search_documents_v43_facets (work_type, rights_status, sensitivity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS authority_source_fetch_runs_v44 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  adapter_id VARCHAR(128) NOT NULL,
  mode VARCHAR(64) NOT NULL DEFAULT 'metadata_candidate_only',
  status VARCHAR(64) NOT NULL DEFAULT 'started',
  candidate_count INT NOT NULL DEFAULT 0,
  blocked_count INT NOT NULL DEFAULT 0,
  report_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_authority_source_fetch_runs_v44_adapter (adapter_id, status)
);

CREATE TABLE IF NOT EXISTS authority_source_candidates_v44 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  candidate_id VARCHAR(128) NOT NULL,
  adapter_id VARCHAR(128) NOT NULL,
  source_url TEXT,
  source_title VARCHAR(512),
  publisher VARCHAR(255),
  query_hint VARCHAR(512),
  rights_status VARCHAR(128) NOT NULL DEFAULT 'unknown_pending_review',
  sensitivity VARCHAR(128) NOT NULL DEFAULT 'metadata_only_review_required',
  review_status VARCHAR(128) NOT NULL DEFAULT 'candidate_needs_human_review',
  blocked_terms_json JSON,
  candidate_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_authority_source_candidates_v44_candidate (candidate_id),
  KEY idx_authority_source_candidates_v44_adapter (adapter_id, review_status)
);

CREATE TABLE IF NOT EXISTS music_candidate_reviews_v44 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  candidate_id VARCHAR(128) NOT NULL,
  review_type VARCHAR(128) NOT NULL DEFAULT 'metadata_rights_review',
  review_status VARCHAR(128) NOT NULL DEFAULT 'open',
  reviewer VARCHAR(190),
  notes TEXT,
  decision_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_music_candidate_reviews_v44_status (review_status)
);

CREATE TABLE IF NOT EXISTS main_site_page_contracts_v44 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  route_path VARCHAR(255) NOT NULL,
  page_file VARCHAR(512) NOT NULL,
  data_endpoint VARCHAR(512) NOT NULL,
  seo_json JSON,
  safety_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_main_site_page_contracts_v44_route (route_path)
);
