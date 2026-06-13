-- v45 formal review workflow, search quality, source worker, SEO and VPS preflight governance
CREATE TABLE IF NOT EXISTS speech_review_decisions_v45 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  decision_id VARCHAR(128) NOT NULL,
  asset_id VARCHAR(128) NOT NULL,
  reviewer_id VARCHAR(190) NOT NULL,
  decision ENUM('approve_gate','reject_gate','return_for_fix') NOT NULL,
  gate_name VARCHAR(128) NOT NULL,
  decision_reason TEXT NOT NULL,
  evidence_url TEXT,
  previous_status VARCHAR(128),
  next_status VARCHAR(128) NOT NULL,
  decision_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_review_decisions_v45_decision (decision_id),
  KEY idx_speech_review_decisions_v45_asset (asset_id, gate_name, decision),
  KEY idx_speech_review_decisions_v45_reviewer (reviewer_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS speech_review_audit_log_v45 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  audit_id VARCHAR(128) NOT NULL,
  asset_id VARCHAR(128) NOT NULL,
  actor_id VARCHAR(190) NOT NULL,
  action VARCHAR(128) NOT NULL,
  request_hash VARCHAR(128) NOT NULL,
  hmac_key_id VARCHAR(128),
  before_json JSON,
  after_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_review_audit_log_v45_audit (audit_id),
  KEY idx_speech_review_audit_log_v45_asset (asset_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS speech_alignment_imports_v45 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  import_id VARCHAR(128) NOT NULL,
  asset_id VARCHAR(128) NOT NULL,
  aligner_version VARCHAR(128) NOT NULL,
  reviewer_id VARCHAR(190) NOT NULL,
  alignment_score DECIMAL(8,4) NOT NULL,
  transcript_hash VARCHAR(128) NOT NULL,
  alignment_json JSON,
  accepted BOOLEAN NOT NULL DEFAULT FALSE,
  reject_reasons_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_alignment_imports_v45_import (import_id),
  KEY idx_speech_alignment_imports_v45_asset (asset_id, accepted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS music_search_synonyms_v45 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  canonical VARCHAR(190) NOT NULL,
  alias VARCHAR(190) NOT NULL,
  boost DECIMAL(8,4) NOT NULL DEFAULT 1.0000,
  locale VARCHAR(32) NOT NULL DEFAULT 'zh-Hant',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_music_search_synonyms_v45_alias (canonical, alias),
  KEY idx_music_search_synonyms_v45_alias (alias)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS music_search_quality_tests_v45 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  test_id VARCHAR(128) NOT NULL,
  query_text VARCHAR(512) NOT NULL,
  expected_alias_json JSON,
  min_hits_static INT NOT NULL DEFAULT 0,
  last_status VARCHAR(64) NOT NULL DEFAULT 'not_run',
  last_report_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_music_search_quality_tests_v45_test (test_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS authority_source_adapter_state_v45 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  adapter_id VARCHAR(128) NOT NULL,
  canonical_base_url TEXT,
  rate_limit_per_minute INT NOT NULL DEFAULT 10,
  last_run_at TIMESTAMP NULL,
  last_status VARCHAR(64),
  state_json JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_authority_source_adapter_state_v45_adapter (adapter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS authority_source_worker_runs_v45 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_id VARCHAR(128) NOT NULL,
  adapter_id VARCHAR(128) NOT NULL,
  mode VARCHAR(64) NOT NULL DEFAULT 'dry_run',
  status VARCHAR(64) NOT NULL DEFAULT 'started',
  candidate_count INT NOT NULL DEFAULT 0,
  deduped_count INT NOT NULL DEFAULT 0,
  blocked_count INT NOT NULL DEFAULT 0,
  report_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_authority_source_worker_runs_v45_run (run_id),
  KEY idx_authority_source_worker_runs_v45_adapter (adapter_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS authority_source_candidates_v45 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  candidate_id VARCHAR(128) NOT NULL,
  adapter_id VARCHAR(128) NOT NULL,
  canonical_url TEXT,
  title VARCHAR(512),
  publisher VARCHAR(255),
  rights_status VARCHAR(128) NOT NULL DEFAULT 'unknown_pending_review',
  sensitivity VARCHAR(128) NOT NULL DEFAULT 'metadata_only_review_required',
  dedupe_hash VARCHAR(128) NOT NULL,
  review_status VARCHAR(128) NOT NULL DEFAULT 'candidate_needs_human_review',
  candidate_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_authority_source_candidates_v45_candidate (candidate_id),
  UNIQUE KEY uq_authority_source_candidates_v45_dedupe (dedupe_hash),
  KEY idx_authority_source_candidates_v45_adapter (adapter_id, review_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS music_candidate_reviews_v45 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  review_id VARCHAR(128) NOT NULL,
  candidate_id VARCHAR(128) NOT NULL,
  reviewer_id VARCHAR(190),
  decision VARCHAR(64) NOT NULL DEFAULT 'pending',
  decision_reason TEXT,
  review_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_music_candidate_reviews_v45_review (review_id),
  KEY idx_music_candidate_reviews_v45_candidate (candidate_id, decision)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS speech_split_leakage_reports_v45 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  report_id VARCHAR(128) NOT NULL,
  export_id VARCHAR(128),
  leakage_found BOOLEAN NOT NULL DEFAULT FALSE,
  speaker_overlap_count INT NOT NULL DEFAULT 0,
  asset_overlap_count INT NOT NULL DEFAULT 0,
  duplicate_transcript_count INT NOT NULL DEFAULT 0,
  report_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_split_leakage_reports_v45_report (report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS speech_eval_comparisons_v45 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comparison_id VARCHAR(128) NOT NULL,
  model_type VARCHAR(32) NOT NULL,
  baseline_model_version VARCHAR(128),
  candidate_model_version VARCHAR(128),
  mos_delta DECIMAL(8,4),
  wer_delta DECIMAL(8,4),
  cer_delta DECIMAL(8,4),
  release_recommendation VARCHAR(128) NOT NULL DEFAULT 'do_not_release',
  report_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_eval_comparisons_v45_comparison (comparison_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS speech_model_card_reviews_v45 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  review_id VARCHAR(128) NOT NULL,
  model_card_id VARCHAR(128) NOT NULL,
  reviewer_id VARCHAR(190) NOT NULL,
  decision VARCHAR(64) NOT NULL DEFAULT 'pending',
  public_release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  decision_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_model_card_reviews_v45_review (review_id),
  KEY idx_speech_model_card_reviews_v45_card (model_card_id, decision)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS main_site_seo_artifacts_v45 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  artifact_id VARCHAR(128) NOT NULL,
  route_path VARCHAR(255) NOT NULL,
  artifact_type VARCHAR(64) NOT NULL,
  artifact_json JSON,
  no_lyrics BOOLEAN NOT NULL DEFAULT TRUE,
  no_audio_download BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_main_site_seo_artifacts_v45_artifact (artifact_id),
  KEY idx_main_site_seo_artifacts_v45_route (route_path, artifact_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS vps_preflight_reports_v45 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  report_id VARCHAR(128) NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'not_run',
  checks_passed INT NOT NULL DEFAULT 0,
  checks_failed INT NOT NULL DEFAULT 0,
  report_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_vps_preflight_reports_v45_report (report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
