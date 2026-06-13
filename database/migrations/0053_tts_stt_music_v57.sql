-- v57 TTS/STT music release evidence ledger, dataset export, search decision and operations notifications

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS release_evidence_ledger_entries_v57 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  entry_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  entry_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_release_evidence_ledger_entries_v57_entry_id (entry_id),
  KEY idx_release_evidence_ledger_entries_v57_status (status),
  KEY idx_release_evidence_ledger_entries_v57_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS release_evidence_certificate_seals_v57 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  seal_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  seal_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_release_evidence_certificate_seals_v57_seal_id (seal_id),
  KEY idx_release_evidence_certificate_seals_v57_status (status),
  KEY idx_release_evidence_certificate_seals_v57_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS release_evidence_backup_restore_records_v57 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  record_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  record_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_release_evidence_backup_restore_records_v57_record_id (record_id),
  KEY idx_release_evidence_backup_restore_records_v57_status (status),
  KEY idx_release_evidence_backup_restore_records_v57_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS release_evidence_observation_samples_v57 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sample_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  sample_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_release_evidence_observation_samples_v57_sample_id (sample_id),
  KEY idx_release_evidence_observation_samples_v57_status (status),
  KEY idx_release_evidence_observation_samples_v57_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS legal_speech_dataset_exports_v57 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  export_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  export_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_legal_speech_dataset_exports_v57_export_id (export_id),
  KEY idx_legal_speech_dataset_exports_v57_status (status),
  KEY idx_legal_speech_dataset_exports_v57_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS legal_speech_checksum_manifests_v57 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  manifest_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  manifest_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_legal_speech_checksum_manifests_v57_manifest_id (manifest_id),
  KEY idx_legal_speech_checksum_manifests_v57_status (status),
  KEY idx_legal_speech_checksum_manifests_v57_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS legal_speech_blocked_reports_v57 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  report_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  report_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_legal_speech_blocked_reports_v57_report_id (report_id),
  KEY idx_legal_speech_blocked_reports_v57_status (status),
  KEY idx_legal_speech_blocked_reports_v57_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS legal_speech_model_cards_v57 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  model_card_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  model_card_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_legal_speech_model_cards_v57_model_card_id (model_card_id),
  KEY idx_legal_speech_model_cards_v57_status (status),
  KEY idx_legal_speech_model_cards_v57_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS music_search_monitoring_decisions_v57 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  decision_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  decision_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_music_search_monitoring_decisions_v57_decision_id (decision_id),
  KEY idx_music_search_monitoring_decisions_v57_status (status),
  KEY idx_music_search_monitoring_decisions_v57_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS music_search_anomaly_tasks_v57 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  task_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  task_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_music_search_anomaly_tasks_v57_task_id (task_id),
  KEY idx_music_search_anomaly_tasks_v57_status (status),
  KEY idx_music_search_anomaly_tasks_v57_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS music_search_rollback_decisions_v57 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  rollback_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  rollback_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_music_search_rollback_decisions_v57_rollback_id (rollback_id),
  KEY idx_music_search_rollback_decisions_v57_status (status),
  KEY idx_music_search_rollback_decisions_v57_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS authority_metadata_public_evidence_v57 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  evidence_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  evidence_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_authority_metadata_public_evidence_v57_evidence_id (evidence_id),
  KEY idx_authority_metadata_public_evidence_v57_status (status),
  KEY idx_authority_metadata_public_evidence_v57_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS authority_metadata_citation_screenshots_v57 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  screenshot_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  screenshot_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_authority_metadata_citation_screenshots_v57_screenshot_id (screenshot_id),
  KEY idx_authority_metadata_citation_screenshots_v57_status (status),
  KEY idx_authority_metadata_citation_screenshots_v57_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS authority_metadata_takedown_rehearsals_v57 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  rehearsal_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  rehearsal_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_authority_metadata_takedown_rehearsals_v57_rehearsal_id (rehearsal_id),
  KEY idx_authority_metadata_takedown_rehearsals_v57_status (status),
  KEY idx_authority_metadata_takedown_rehearsals_v57_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS speech_governance_artifact_downloads_v57 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  download_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  download_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_speech_governance_artifact_downloads_v57_download_id (download_id),
  KEY idx_speech_governance_artifact_downloads_v57_status (status),
  KEY idx_speech_governance_artifact_downloads_v57_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS speech_governance_audit_exports_v57 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  export_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  export_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_speech_governance_audit_exports_v57_export_id (export_id),
  KEY idx_speech_governance_audit_exports_v57_status (status),
  KEY idx_speech_governance_audit_exports_v57_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS speech_governance_permission_checks_v57 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  check_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  check_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_speech_governance_permission_checks_v57_check_id (check_id),
  KEY idx_speech_governance_permission_checks_v57_status (status),
  KEY idx_speech_governance_permission_checks_v57_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_ops_report_deliveries_v57 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  delivery_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  delivery_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_site_ops_report_deliveries_v57_delivery_id (delivery_id),
  KEY idx_site_ops_report_deliveries_v57_status (status),
  KEY idx_site_ops_report_deliveries_v57_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_ops_notification_channels_v57 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  channel_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  channel_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_site_ops_notification_channels_v57_channel_id (channel_id),
  KEY idx_site_ops_notification_channels_v57_status (status),
  KEY idx_site_ops_notification_channels_v57_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_ops_alert_acknowledgements_v57 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ack_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  ack_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_site_ops_alert_acknowledgements_v57_ack_id (ack_id),
  KEY idx_site_ops_alert_acknowledgements_v57_status (status),
  KEY idx_site_ops_alert_acknowledgements_v57_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_ops_weekly_summaries_v57 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  summary_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  summary_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_site_ops_weekly_summaries_v57_summary_id (summary_id),
  KEY idx_site_ops_weekly_summaries_v57_status (status),
  KEY idx_site_ops_weekly_summaries_v57_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
