-- v60 TTS/STT Music final seal, immutable dataset freeze, search SLA, metadata expansion, governance alert closure, operations real delivery

CREATE TABLE IF NOT EXISTS release_certificate_final_seals_v60 (
  seal_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_release_certificate_final_seals_v60_actor (actor_id),
  INDEX idx_release_certificate_final_seals_v60_status (status),
  INDEX idx_release_certificate_final_seals_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='release certificate final seal';

CREATE TABLE IF NOT EXISTS release_restore_final_verifications_v60 (
  verification_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_release_restore_final_verifications_v60_actor (actor_id),
  INDEX idx_release_restore_final_verifications_v60_status (status),
  INDEX idx_release_restore_final_verifications_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='restore final verification';

CREATE TABLE IF NOT EXISTS release_rollback_final_verifications_v60 (
  verification_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_release_rollback_final_verifications_v60_actor (actor_id),
  INDEX idx_release_rollback_final_verifications_v60_status (status),
  INDEX idx_release_rollback_final_verifications_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='rollback final verification';

CREATE TABLE IF NOT EXISTS release_dns_cloudflare_final_verifications_v60 (
  verification_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_release_dns_cloudflare_final_verifications_v60_actor (actor_id),
  INDEX idx_release_dns_cloudflare_final_verifications_v60_status (status),
  INDEX idx_release_dns_cloudflare_final_verifications_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='dns cloudflare final verification';

CREATE TABLE IF NOT EXISTS release_observation_final_verifications_v60 (
  verification_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_release_observation_final_verifications_v60_actor (actor_id),
  INDEX idx_release_observation_final_verifications_v60_status (status),
  INDEX idx_release_observation_final_verifications_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='observation final verification';

CREATE TABLE IF NOT EXISTS release_hash_chain_final_verifications_v60 (
  verification_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_release_hash_chain_final_verifications_v60_actor (actor_id),
  INDEX idx_release_hash_chain_final_verifications_v60_status (status),
  INDEX idx_release_hash_chain_final_verifications_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='hash chain final verification';

CREATE TABLE IF NOT EXISTS legal_speech_dataset_immutable_freezes_v60 (
  freeze_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_dataset_immutable_freezes_v60_actor (actor_id),
  INDEX idx_legal_speech_dataset_immutable_freezes_v60_status (status),
  INDEX idx_legal_speech_dataset_immutable_freezes_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='legal speech dataset immutable freeze';

CREATE TABLE IF NOT EXISTS legal_speech_final_train_dev_test_exports_v60 (
  export_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_final_train_dev_test_exports_v60_actor (actor_id),
  INDEX idx_legal_speech_final_train_dev_test_exports_v60_status (status),
  INDEX idx_legal_speech_final_train_dev_test_exports_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='legal speech final train dev test export';

CREATE TABLE IF NOT EXISTS legal_speech_dataset_version_locks_v60 (
  lock_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_dataset_version_locks_v60_actor (actor_id),
  INDEX idx_legal_speech_dataset_version_locks_v60_status (status),
  INDEX idx_legal_speech_dataset_version_locks_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='legal speech dataset version lock';

CREATE TABLE IF NOT EXISTS legal_speech_final_checksum_manifests_v60 (
  checksum_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_final_checksum_manifests_v60_actor (actor_id),
  INDEX idx_legal_speech_final_checksum_manifests_v60_status (status),
  INDEX idx_legal_speech_final_checksum_manifests_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='legal speech final checksum manifest';

CREATE TABLE IF NOT EXISTS legal_speech_final_model_cards_v60 (
  model_card_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_final_model_cards_v60_actor (actor_id),
  INDEX idx_legal_speech_final_model_cards_v60_status (status),
  INDEX idx_legal_speech_final_model_cards_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='legal speech final model card';

CREATE TABLE IF NOT EXISTS search_weekly_quality_reports_v60 (
  report_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_search_weekly_quality_reports_v60_actor (actor_id),
  INDEX idx_search_weekly_quality_reports_v60_status (status),
  INDEX idx_search_weekly_quality_reports_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='search weekly quality report';

CREATE TABLE IF NOT EXISTS search_anomaly_sla_tasks_v60 (
  task_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_search_anomaly_sla_tasks_v60_actor (actor_id),
  INDEX idx_search_anomaly_sla_tasks_v60_status (status),
  INDEX idx_search_anomaly_sla_tasks_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='search anomaly sla task';

CREATE TABLE IF NOT EXISTS search_policy_regression_tests_v60 (
  test_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_search_policy_regression_tests_v60_actor (actor_id),
  INDEX idx_search_policy_regression_tests_v60_status (status),
  INDEX idx_search_policy_regression_tests_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='search policy regression test';

CREATE TABLE IF NOT EXISTS search_rollback_drills_v60 (
  drill_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_search_rollback_drills_v60_actor (actor_id),
  INDEX idx_search_rollback_drills_v60_status (status),
  INDEX idx_search_rollback_drills_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='search rollback drill';

CREATE TABLE IF NOT EXISTS authority_metadata_source_expansions_v60 (
  record_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_authority_metadata_source_expansions_v60_actor (actor_id),
  INDEX idx_authority_metadata_source_expansions_v60_status (status),
  INDEX idx_authority_metadata_source_expansions_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='authority metadata source expansion';

CREATE TABLE IF NOT EXISTS authority_citation_evidence_seals_v60 (
  evidence_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_authority_citation_evidence_seals_v60_actor (actor_id),
  INDEX idx_authority_citation_evidence_seals_v60_status (status),
  INDEX idx_authority_citation_evidence_seals_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='authority citation evidence seal';

CREATE TABLE IF NOT EXISTS authority_takedown_evidence_seals_v60 (
  evidence_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_authority_takedown_evidence_seals_v60_actor (actor_id),
  INDEX idx_authority_takedown_evidence_seals_v60_status (status),
  INDEX idx_authority_takedown_evidence_seals_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='authority takedown evidence seal';

CREATE TABLE IF NOT EXISTS authority_source_drift_evidence_seals_v60 (
  evidence_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_authority_source_drift_evidence_seals_v60_actor (actor_id),
  INDEX idx_authority_source_drift_evidence_seals_v60_status (status),
  INDEX idx_authority_source_drift_evidence_seals_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='authority source drift evidence seal';

CREATE TABLE IF NOT EXISTS governance_download_alerts_v60 (
  alert_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_governance_download_alerts_v60_actor (actor_id),
  INDEX idx_governance_download_alerts_v60_status (status),
  INDEX idx_governance_download_alerts_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='governance download alert';

CREATE TABLE IF NOT EXISTS governance_download_alert_acks_v60 (
  ack_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_governance_download_alert_acks_v60_actor (actor_id),
  INDEX idx_governance_download_alert_acks_v60_status (status),
  INDEX idx_governance_download_alert_acks_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='governance download alert ack';

CREATE TABLE IF NOT EXISTS governance_download_alert_closures_v60 (
  closure_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_governance_download_alert_closures_v60_actor (actor_id),
  INDEX idx_governance_download_alert_closures_v60_status (status),
  INDEX idx_governance_download_alert_closures_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='governance download alert closure';

CREATE TABLE IF NOT EXISTS governance_weekly_audit_reports_v60 (
  report_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_governance_weekly_audit_reports_v60_actor (actor_id),
  INDEX idx_governance_weekly_audit_reports_v60_status (status),
  INDEX idx_governance_weekly_audit_reports_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='governance weekly audit report';

CREATE TABLE IF NOT EXISTS governance_rbac_download_tests_v60 (
  test_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_governance_rbac_download_tests_v60_actor (actor_id),
  INDEX idx_governance_rbac_download_tests_v60_status (status),
  INDEX idx_governance_rbac_download_tests_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='governance rbac download test';

CREATE TABLE IF NOT EXISTS operations_notification_deliveries_v60 (
  delivery_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_operations_notification_deliveries_v60_actor (actor_id),
  INDEX idx_operations_notification_deliveries_v60_status (status),
  INDEX idx_operations_notification_deliveries_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='operations notification delivery';

CREATE TABLE IF NOT EXISTS operations_notification_acks_v60 (
  ack_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_operations_notification_acks_v60_actor (actor_id),
  INDEX idx_operations_notification_acks_v60_status (status),
  INDEX idx_operations_notification_acks_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='operations notification ack';

CREATE TABLE IF NOT EXISTS operations_notification_escalations_v60 (
  escalation_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_operations_notification_escalations_v60_actor (actor_id),
  INDEX idx_operations_notification_escalations_v60_status (status),
  INDEX idx_operations_notification_escalations_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='operations notification escalation';

CREATE TABLE IF NOT EXISTS operations_notification_closures_v60 (
  closure_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_operations_notification_closures_v60_actor (actor_id),
  INDEX idx_operations_notification_closures_v60_status (status),
  INDEX idx_operations_notification_closures_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='operations notification closure';

CREATE TABLE IF NOT EXISTS operations_weekly_improvement_tasks_v60 (
  task_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_operations_weekly_improvement_tasks_v60_actor (actor_id),
  INDEX idx_operations_weekly_improvement_tasks_v60_status (status),
  INDEX idx_operations_weekly_improvement_tasks_v60_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='operations weekly improvement task';
