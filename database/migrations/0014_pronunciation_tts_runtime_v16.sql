-- v16 pronunciation-first TTS runtime. MySQL/TiDB compatible.
-- Public UI must use verified source audio first. Neural TTS is disabled until trained, licensed and reviewed.
CREATE TABLE IF NOT EXISTS puyuma_pronunciation_assets_v16 (
  id varchar(80) PRIMARY KEY,
  corpus_entry_id varchar(80) NOT NULL,
  dialect_code varchar(16) NOT NULL,
  dialect_name varchar(128) NOT NULL,
  puyuma_form text NOT NULL,
  zh_tw text,
  source_audio_url text,
  local_mirror_path text,
  audio_mode varchar(64) NOT NULL DEFAULT 'human_recorded_source_audio_primary',
  source_phon text,
  ipa_value text,
  g2p_status varchar(128),
  ipa_status varchar(128),
  is_synthetic boolean NOT NULL DEFAULT false,
  public_playback_allowed boolean NOT NULL DEFAULT true,
  license_review_required boolean NOT NULL DEFAULT true,
  review_status varchar(80) NOT NULL DEFAULT 'approved_for_public_learning',
  release_channel varchar(64) NOT NULL DEFAULT 'public',
  source_json json,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_pron_assets_entry (corpus_entry_id),
  KEY idx_pron_assets_dialect (dialect_code, dialect_name),
  KEY idx_pron_assets_public (release_channel, public_playback_allowed, is_synthetic)
);

CREATE TABLE IF NOT EXISTS puyuma_tts_voice_models_v16 (
  id varchar(80) PRIMARY KEY,
  model_type varchar(80) NOT NULL,
  model_status varchar(80) NOT NULL,
  display_name_zh varchar(255) NOT NULL,
  dialect_scope_json json,
  public_ui_enabled boolean NOT NULL DEFAULT false,
  supports_free_text_tts boolean NOT NULL DEFAULT false,
  training_requirements_json json,
  quality_gate_json json,
  notes_zh text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS puyuma_tts_synthesis_requests_v16 (
  id varchar(80) PRIMARY KEY,
  request_text text NOT NULL,
  dialect_code varchar(16),
  model_id varchar(80) NOT NULL,
  request_mode varchar(64) NOT NULL DEFAULT 'source_audio_or_queue',
  status varchar(64) NOT NULL DEFAULT 'queued',
  matched_pronunciation_asset_id varchar(80),
  output_audio_url text,
  reject_reason text,
  human_review_required boolean NOT NULL DEFAULT true,
  created_by varchar(128),
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_tts_req_status (status, dialect_code),
  KEY idx_tts_req_model (model_id)
);

CREATE TABLE IF NOT EXISTS puyuma_tts_training_corpus_v16 (
  id varchar(80) PRIMARY KEY,
  pronunciation_asset_id varchar(80) NOT NULL,
  dialect_code varchar(16) NOT NULL,
  transcript text NOT NULL,
  audio_url text NOT NULL,
  source_phon text,
  ipa_value text,
  license_status varchar(80) NOT NULL DEFAULT 'needs_review_before_training',
  speaker_consent_status varchar(80) NOT NULL DEFAULT 'unknown_or_dataset_level_only',
  usable_for_training boolean NOT NULL DEFAULT false,
  notes_zh text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  KEY idx_training_corpus_dialect (dialect_code, usable_for_training),
  KEY idx_training_corpus_license (license_status)
);

CREATE OR REPLACE VIEW vw_public_puyuma_pronunciation_assets_v16 AS
SELECT id, corpus_entry_id, dialect_code, dialect_name, puyuma_form, zh_tw, source_audio_url, local_mirror_path,
       audio_mode, source_phon, ipa_value, g2p_status, ipa_status, is_synthetic, review_status, release_channel
FROM puyuma_pronunciation_assets_v16
WHERE release_channel='public' AND public_playback_allowed=true AND is_synthetic=false;
