-- v58 TTS/STT Music release seal, dataset, search, metadata audit, governance RBAC, ops delivery

CREATE TABLE IF NOT EXISTS release_certificate_immutable_seals_v58 (
  seal_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_release_certificate_immutable_seals_v58_actor (actor_id),
  INDEX idx_release_certificate_immutable_seals_v58_status (status),
  INDEX idx_release_certificate_immutable_seals_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='release certificate immutable seal';

CREATE TABLE IF NOT EXISTS release_evidence_ledger_entries_v58 (
  entry_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_release_evidence_ledger_entries_v58_actor (actor_id),
  INDEX idx_release_evidence_ledger_entries_v58_status (status),
  INDEX idx_release_evidence_ledger_entries_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='release evidence ledger entry';

CREATE TABLE IF NOT EXISTS release_backup_restore_evidence_v58 (
  record_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_release_backup_restore_evidence_v58_actor (actor_id),
  INDEX idx_release_backup_restore_evidence_v58_status (status),
  INDEX idx_release_backup_restore_evidence_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='backup restore evidence';

CREATE TABLE IF NOT EXISTS release_dns_cloudflare_evidence_v58 (
  evidence_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_release_dns_cloudflare_evidence_v58_actor (actor_id),
  INDEX idx_release_dns_cloudflare_evidence_v58_status (status),
  INDEX idx_release_dns_cloudflare_evidence_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='dns cloudflare evidence';

CREATE TABLE IF NOT EXISTS release_observation_evidence_v58 (
  observation_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_release_observation_evidence_v58_actor (actor_id),
  INDEX idx_release_observation_evidence_v58_status (status),
  INDEX idx_release_observation_evidence_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='30m observation evidence';

CREATE TABLE IF NOT EXISTS release_hash_chain_verifications_v58 (
  verification_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_release_hash_chain_verifications_v58_actor (actor_id),
  INDEX idx_release_hash_chain_verifications_v58_status (status),
  INDEX idx_release_hash_chain_verifications_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='hash chain verification';

CREATE TABLE IF NOT EXISTS legal_speech_dataset_exports_v58 (
  export_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_dataset_exports_v58_actor (actor_id),
  INDEX idx_legal_speech_dataset_exports_v58_status (status),
  INDEX idx_legal_speech_dataset_exports_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='legal speech dataset export';

CREATE TABLE IF NOT EXISTS legal_speech_dataset_manifests_v58 (
  manifest_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_dataset_manifests_v58_actor (actor_id),
  INDEX idx_legal_speech_dataset_manifests_v58_status (status),
  INDEX idx_legal_speech_dataset_manifests_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='legal speech dataset manifest';

CREATE TABLE IF NOT EXISTS legal_speech_dataset_checksums_v58 (
  checksum_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_dataset_checksums_v58_actor (actor_id),
  INDEX idx_legal_speech_dataset_checksums_v58_status (status),
  INDEX idx_legal_speech_dataset_checksums_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='legal speech checksum';

CREATE TABLE IF NOT EXISTS legal_speech_dataset_blocked_reports_v58 (
  report_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_dataset_blocked_reports_v58_actor (actor_id),
  INDEX idx_legal_speech_dataset_blocked_reports_v58_status (status),
  INDEX idx_legal_speech_dataset_blocked_reports_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='legal speech blocked report';

CREATE TABLE IF NOT EXISTS legal_speech_model_cards_v58 (
  model_card_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_model_cards_v58_actor (actor_id),
  INDEX idx_legal_speech_model_cards_v58_status (status),
  INDEX idx_legal_speech_model_cards_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='legal speech model card';

CREATE TABLE IF NOT EXISTS search_formal_config_decisions_v58 (
  decision_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_search_formal_config_decisions_v58_actor (actor_id),
  INDEX idx_search_formal_config_decisions_v58_status (status),
  INDEX idx_search_formal_config_decisions_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='search formal config decision';

CREATE TABLE IF NOT EXISTS search_100_rollout_monitoring_v58 (
  monitoring_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_search_100_rollout_monitoring_v58_actor (actor_id),
  INDEX idx_search_100_rollout_monitoring_v58_status (status),
  INDEX idx_search_100_rollout_monitoring_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='search 100 rollout monitoring';

CREATE TABLE IF NOT EXISTS search_anomaly_human_tasks_v58 (
  task_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_search_anomaly_human_tasks_v58_actor (actor_id),
  INDEX idx_search_anomaly_human_tasks_v58_status (status),
  INDEX idx_search_anomaly_human_tasks_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='search anomaly human task';

CREATE TABLE IF NOT EXISTS search_rollback_events_v58 (
  rollback_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_search_rollback_events_v58_actor (actor_id),
  INDEX idx_search_rollback_events_v58_status (status),
  INDEX idx_search_rollback_events_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='search rollback event';

CREATE TABLE IF NOT EXISTS authority_metadata_audit_seals_v58 (
  seal_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_authority_metadata_audit_seals_v58_actor (actor_id),
  INDEX idx_authority_metadata_audit_seals_v58_status (status),
  INDEX idx_authority_metadata_audit_seals_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='authority metadata audit seal';

CREATE TABLE IF NOT EXISTS authority_metadata_sitemap_og_evidence_v58 (
  evidence_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_authority_metadata_sitemap_og_evidence_v58_actor (actor_id),
  INDEX idx_authority_metadata_sitemap_og_evidence_v58_status (status),
  INDEX idx_authority_metadata_sitemap_og_evidence_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='authority sitemap og evidence';

CREATE TABLE IF NOT EXISTS authority_metadata_citation_evidence_v58 (
  citation_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_authority_metadata_citation_evidence_v58_actor (actor_id),
  INDEX idx_authority_metadata_citation_evidence_v58_status (status),
  INDEX idx_authority_metadata_citation_evidence_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='authority citation evidence';

CREATE TABLE IF NOT EXISTS authority_metadata_takedown_evidence_v58 (
  takedown_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_authority_metadata_takedown_evidence_v58_actor (actor_id),
  INDEX idx_authority_metadata_takedown_evidence_v58_status (status),
  INDEX idx_authority_metadata_takedown_evidence_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='authority takedown evidence';

CREATE TABLE IF NOT EXISTS governance_artifact_downloads_v58 (
  download_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_governance_artifact_downloads_v58_actor (actor_id),
  INDEX idx_governance_artifact_downloads_v58_status (status),
  INDEX idx_governance_artifact_downloads_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='governance artifact download';

CREATE TABLE IF NOT EXISTS governance_permission_tests_v58 (
  test_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_governance_permission_tests_v58_actor (actor_id),
  INDEX idx_governance_permission_tests_v58_status (status),
  INDEX idx_governance_permission_tests_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='governance permission test';

CREATE TABLE IF NOT EXISTS governance_audit_exports_v58 (
  export_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_governance_audit_exports_v58_actor (actor_id),
  INDEX idx_governance_audit_exports_v58_status (status),
  INDEX idx_governance_audit_exports_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='governance audit export';

CREATE TABLE IF NOT EXISTS governance_watermark_events_v58 (
  watermark_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_governance_watermark_events_v58_actor (actor_id),
  INDEX idx_governance_watermark_events_v58_status (status),
  INDEX idx_governance_watermark_events_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='governance watermark event';

CREATE TABLE IF NOT EXISTS site_ops_report_deliveries_v58 (
  delivery_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_site_ops_report_deliveries_v58_actor (actor_id),
  INDEX idx_site_ops_report_deliveries_v58_status (status),
  INDEX idx_site_ops_report_deliveries_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='site ops report delivery';

CREATE TABLE IF NOT EXISTS site_ops_channel_tests_v58 (
  test_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_site_ops_channel_tests_v58_actor (actor_id),
  INDEX idx_site_ops_channel_tests_v58_status (status),
  INDEX idx_site_ops_channel_tests_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='site ops channel test';

CREATE TABLE IF NOT EXISTS site_ops_alert_escalations_v58 (
  escalation_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_site_ops_alert_escalations_v58_actor (actor_id),
  INDEX idx_site_ops_alert_escalations_v58_status (status),
  INDEX idx_site_ops_alert_escalations_v58_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='site ops alert escalation';
