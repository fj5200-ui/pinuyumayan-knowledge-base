-- v59 TTS/STT Music post-seal validation, dataset freeze, production search policy, metadata expansion, governance download hardening, operations closed loop

CREATE TABLE IF NOT EXISTS release_certificate_postseal_validations_v59 (
  validation_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_release_certificate_postseal_validations_v59_actor (actor_id),
  INDEX idx_release_certificate_postseal_validations_v59_status (status),
  INDEX idx_release_certificate_postseal_validations_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='release certificate post-seal validation';

CREATE TABLE IF NOT EXISTS release_restore_audit_samples_v59 (
  sample_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_release_restore_audit_samples_v59_actor (actor_id),
  INDEX idx_release_restore_audit_samples_v59_status (status),
  INDEX idx_release_restore_audit_samples_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='restore audit sample';

CREATE TABLE IF NOT EXISTS release_rollback_audit_samples_v59 (
  sample_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_release_rollback_audit_samples_v59_actor (actor_id),
  INDEX idx_release_rollback_audit_samples_v59_status (status),
  INDEX idx_release_rollback_audit_samples_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='rollback audit sample';

CREATE TABLE IF NOT EXISTS release_dns_cloudflare_audit_samples_v59 (
  sample_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_release_dns_cloudflare_audit_samples_v59_actor (actor_id),
  INDEX idx_release_dns_cloudflare_audit_samples_v59_status (status),
  INDEX idx_release_dns_cloudflare_audit_samples_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='dns cloudflare audit sample';

CREATE TABLE IF NOT EXISTS release_observation_audit_samples_v59 (
  sample_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_release_observation_audit_samples_v59_actor (actor_id),
  INDEX idx_release_observation_audit_samples_v59_status (status),
  INDEX idx_release_observation_audit_samples_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='observation audit sample';

CREATE TABLE IF NOT EXISTS release_hash_chain_audit_samples_v59 (
  sample_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_release_hash_chain_audit_samples_v59_actor (actor_id),
  INDEX idx_release_hash_chain_audit_samples_v59_status (status),
  INDEX idx_release_hash_chain_audit_samples_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='hash chain audit sample';

CREATE TABLE IF NOT EXISTS legal_speech_dataset_freezes_v59 (
  freeze_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_dataset_freezes_v59_actor (actor_id),
  INDEX idx_legal_speech_dataset_freezes_v59_status (status),
  INDEX idx_legal_speech_dataset_freezes_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='legal speech dataset freeze';

CREATE TABLE IF NOT EXISTS legal_speech_train_dev_test_exports_v59 (
  export_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_train_dev_test_exports_v59_actor (actor_id),
  INDEX idx_legal_speech_train_dev_test_exports_v59_status (status),
  INDEX idx_legal_speech_train_dev_test_exports_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='legal speech train dev test export';

CREATE TABLE IF NOT EXISTS legal_speech_checksum_manifests_v59 (
  checksum_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_checksum_manifests_v59_actor (actor_id),
  INDEX idx_legal_speech_checksum_manifests_v59_status (status),
  INDEX idx_legal_speech_checksum_manifests_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='legal speech checksum manifest';

CREATE TABLE IF NOT EXISTS legal_speech_model_cards_v59 (
  model_card_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_model_cards_v59_actor (actor_id),
  INDEX idx_legal_speech_model_cards_v59_status (status),
  INDEX idx_legal_speech_model_cards_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='legal speech model card';

CREATE TABLE IF NOT EXISTS legal_speech_blocked_reports_v59 (
  report_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_blocked_reports_v59_actor (actor_id),
  INDEX idx_legal_speech_blocked_reports_v59_status (status),
  INDEX idx_legal_speech_blocked_reports_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='legal speech blocked report';

CREATE TABLE IF NOT EXISTS search_production_policies_v59 (
  policy_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_search_production_policies_v59_actor (actor_id),
  INDEX idx_search_production_policies_v59_status (status),
  INDEX idx_search_production_policies_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='search production policy';

CREATE TABLE IF NOT EXISTS search_quality_weekly_reports_v59 (
  report_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_search_quality_weekly_reports_v59_actor (actor_id),
  INDEX idx_search_quality_weekly_reports_v59_status (status),
  INDEX idx_search_quality_weekly_reports_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='search quality weekly report';

CREATE TABLE IF NOT EXISTS search_anomaly_sla_tasks_v59 (
  task_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_search_anomaly_sla_tasks_v59_actor (actor_id),
  INDEX idx_search_anomaly_sla_tasks_v59_status (status),
  INDEX idx_search_anomaly_sla_tasks_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='search anomaly SLA task';

CREATE TABLE IF NOT EXISTS search_rollback_drills_v59 (
  drill_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_search_rollback_drills_v59_actor (actor_id),
  INDEX idx_search_rollback_drills_v59_status (status),
  INDEX idx_search_rollback_drills_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='search rollback drill';

CREATE TABLE IF NOT EXISTS authority_metadata_publication_expansions_v59 (
  record_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_authority_metadata_publication_expansions_v59_actor (actor_id),
  INDEX idx_authority_metadata_publication_expansions_v59_status (status),
  INDEX idx_authority_metadata_publication_expansions_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='authority metadata publication expansion';

CREATE TABLE IF NOT EXISTS authority_citation_screenshot_evidence_v59 (
  evidence_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_authority_citation_screenshot_evidence_v59_actor (actor_id),
  INDEX idx_authority_citation_screenshot_evidence_v59_status (status),
  INDEX idx_authority_citation_screenshot_evidence_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='authority citation screenshot evidence';

CREATE TABLE IF NOT EXISTS authority_takedown_rehearsals_v59 (
  rehearsal_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_authority_takedown_rehearsals_v59_actor (actor_id),
  INDEX idx_authority_takedown_rehearsals_v59_status (status),
  INDEX idx_authority_takedown_rehearsals_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='authority takedown rehearsal';

CREATE TABLE IF NOT EXISTS authority_source_drift_audits_v59 (
  audit_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_authority_source_drift_audits_v59_actor (actor_id),
  INDEX idx_authority_source_drift_audits_v59_status (status),
  INDEX idx_authority_source_drift_audits_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='authority source drift audit';

CREATE TABLE IF NOT EXISTS governance_download_watermark_verifications_v59 (
  verification_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_governance_download_watermark_verifications_v59_actor (actor_id),
  INDEX idx_governance_download_watermark_verifications_v59_status (status),
  INDEX idx_governance_download_watermark_verifications_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='governance download watermark verification';

CREATE TABLE IF NOT EXISTS governance_abnormal_download_alerts_v59 (
  alert_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_governance_abnormal_download_alerts_v59_actor (actor_id),
  INDEX idx_governance_abnormal_download_alerts_v59_status (status),
  INDEX idx_governance_abnormal_download_alerts_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='governance abnormal download alert';

CREATE TABLE IF NOT EXISTS governance_rbac_test_reports_v59 (
  report_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_governance_rbac_test_reports_v59_actor (actor_id),
  INDEX idx_governance_rbac_test_reports_v59_status (status),
  INDEX idx_governance_rbac_test_reports_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='governance RBAC test report';

CREATE TABLE IF NOT EXISTS governance_audit_export_signoffs_v59 (
  signoff_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_governance_audit_export_signoffs_v59_actor (actor_id),
  INDEX idx_governance_audit_export_signoffs_v59_status (status),
  INDEX idx_governance_audit_export_signoffs_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='governance audit export signoff';

CREATE TABLE IF NOT EXISTS operations_notification_acks_v59 (
  ack_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_operations_notification_acks_v59_actor (actor_id),
  INDEX idx_operations_notification_acks_v59_status (status),
  INDEX idx_operations_notification_acks_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='operations notification ack';

CREATE TABLE IF NOT EXISTS operations_notification_escalations_v59 (
  escalation_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_operations_notification_escalations_v59_actor (actor_id),
  INDEX idx_operations_notification_escalations_v59_status (status),
  INDEX idx_operations_notification_escalations_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='operations notification escalation';

CREATE TABLE IF NOT EXISTS operations_notification_closures_v59 (
  closure_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_operations_notification_closures_v59_actor (actor_id),
  INDEX idx_operations_notification_closures_v59_status (status),
  INDEX idx_operations_notification_closures_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='operations notification closure';

CREATE TABLE IF NOT EXISTS operations_weekly_retrospectives_v59 (
  retrospective_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_operations_weekly_retrospectives_v59_actor (actor_id),
  INDEX idx_operations_weekly_retrospectives_v59_status (status),
  INDEX idx_operations_weekly_retrospectives_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='operations weekly retrospective';

CREATE TABLE IF NOT EXISTS operations_improvement_tasks_v59 (
  task_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NOT NULL DEFAULT 'system',
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  event_json JSON NOT NULL,
  current_hash CHAR(64) NOT NULL,
  previous_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_operations_improvement_tasks_v59_actor (actor_id),
  INDEX idx_operations_improvement_tasks_v59_status (status),
  INDEX idx_operations_improvement_tasks_v59_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='operations improvement task';
