-- v61 TTS/STT Music final ledger, dataset real output, search weekly ops, metadata public expansion, governance alert live test, operations delivery seal

CREATE TABLE IF NOT EXISTS release_final_ledger_entries_v61 (
  ledger_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_release_final_ledger_entries_v61_actor (actor_id),
  INDEX idx_release_final_ledger_entries_v61_created_at (created_at)
) COMMENT='v61 final ledger entries';

CREATE TABLE IF NOT EXISTS release_real_dns_cloudflare_snapshots_v61 (
  snapshot_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_release_real_dns_cloudflare_snapshots_v61_actor (actor_id),
  INDEX idx_release_real_dns_cloudflare_snapshots_v61_created_at (created_at)
) COMMENT='v61 real DNS Cloudflare snapshots';

CREATE TABLE IF NOT EXISTS release_real_restore_rollback_evidence_v61 (
  evidence_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_release_real_restore_rollback_evidence_v61_actor (actor_id),
  INDEX idx_release_real_restore_rollback_evidence_v61_created_at (created_at)
) COMMENT='v61 restore rollback evidence';

CREATE TABLE IF NOT EXISTS release_real_observation_windows_v61 (
  window_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_release_real_observation_windows_v61_actor (actor_id),
  INDEX idx_release_real_observation_windows_v61_created_at (created_at)
) COMMENT='v61 real observation windows';

CREATE TABLE IF NOT EXISTS release_final_audit_samples_v61 (
  sample_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_release_final_audit_samples_v61_actor (actor_id),
  INDEX idx_release_final_audit_samples_v61_created_at (created_at)
) COMMENT='v61 final audit samples';

CREATE TABLE IF NOT EXISTS release_certificate_final_statuses_v61 (
  status_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_release_certificate_final_statuses_v61_actor (actor_id),
  INDEX idx_release_certificate_final_statuses_v61_created_at (created_at)
) COMMENT='v61 release final status';

CREATE TABLE IF NOT EXISTS legal_speech_real_output_batches_v61 (
  batch_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_real_output_batches_v61_actor (actor_id),
  INDEX idx_legal_speech_real_output_batches_v61_created_at (created_at)
) COMMENT='v61 legal speech real output batch';

CREATE TABLE IF NOT EXISTS legal_speech_train_dev_test_exports_v61 (
  export_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_train_dev_test_exports_v61_actor (actor_id),
  INDEX idx_legal_speech_train_dev_test_exports_v61_created_at (created_at)
) COMMENT='v61 legal train dev test export';

CREATE TABLE IF NOT EXISTS legal_speech_dataset_hash_locks_v61 (
  lock_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_dataset_hash_locks_v61_actor (actor_id),
  INDEX idx_legal_speech_dataset_hash_locks_v61_created_at (created_at)
) COMMENT='v61 dataset hash lock';

CREATE TABLE IF NOT EXISTS legal_speech_model_card_releases_v61 (
  model_card_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_model_card_releases_v61_actor (actor_id),
  INDEX idx_legal_speech_model_card_releases_v61_created_at (created_at)
) COMMENT='v61 model card release';

CREATE TABLE IF NOT EXISTS legal_speech_blocked_reports_v61 (
  report_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_blocked_reports_v61_actor (actor_id),
  INDEX idx_legal_speech_blocked_reports_v61_created_at (created_at)
) COMMENT='v61 blocked report';

CREATE TABLE IF NOT EXISTS search_weekly_operations_reports_v61 (
  report_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_search_weekly_operations_reports_v61_actor (actor_id),
  INDEX idx_search_weekly_operations_reports_v61_created_at (created_at)
) COMMENT='v61 search weekly operations report';

CREATE TABLE IF NOT EXISTS search_sla_tasks_v61 (
  task_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_search_sla_tasks_v61_actor (actor_id),
  INDEX idx_search_sla_tasks_v61_created_at (created_at)
) COMMENT='v61 search SLA task';

CREATE TABLE IF NOT EXISTS search_rollback_drill_results_v61 (
  drill_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_search_rollback_drill_results_v61_actor (actor_id),
  INDEX idx_search_rollback_drill_results_v61_created_at (created_at)
) COMMENT='v61 search rollback drill';

CREATE TABLE IF NOT EXISTS search_quality_regression_results_v61 (
  test_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_search_quality_regression_results_v61_actor (actor_id),
  INDEX idx_search_quality_regression_results_v61_created_at (created_at)
) COMMENT='v61 search quality regression result';

CREATE TABLE IF NOT EXISTS authority_public_expansion_records_v61 (
  record_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_authority_public_expansion_records_v61_actor (actor_id),
  INDEX idx_authority_public_expansion_records_v61_created_at (created_at)
) COMMENT='v61 authority public expansion record';

CREATE TABLE IF NOT EXISTS authority_public_citation_screenshots_v61 (
  evidence_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_authority_public_citation_screenshots_v61_actor (actor_id),
  INDEX idx_authority_public_citation_screenshots_v61_created_at (created_at)
) COMMENT='v61 authority citation screenshot';

CREATE TABLE IF NOT EXISTS authority_public_sitemap_og_evidence_v61 (
  evidence_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_authority_public_sitemap_og_evidence_v61_actor (actor_id),
  INDEX idx_authority_public_sitemap_og_evidence_v61_created_at (created_at)
) COMMENT='v61 sitemap OG evidence';

CREATE TABLE IF NOT EXISTS authority_public_takedown_rehearsals_v61 (
  evidence_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_authority_public_takedown_rehearsals_v61_actor (actor_id),
  INDEX idx_authority_public_takedown_rehearsals_v61_created_at (created_at)
) COMMENT='v61 takedown rehearsal evidence';

CREATE TABLE IF NOT EXISTS authority_public_source_drift_snapshots_v61 (
  snapshot_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_authority_public_source_drift_snapshots_v61_actor (actor_id),
  INDEX idx_authority_public_source_drift_snapshots_v61_created_at (created_at)
) COMMENT='v61 source drift snapshot';

CREATE TABLE IF NOT EXISTS governance_download_live_alerts_v61 (
  alert_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_governance_download_live_alerts_v61_actor (actor_id),
  INDEX idx_governance_download_live_alerts_v61_created_at (created_at)
) COMMENT='v61 governance live download alert';

CREATE TABLE IF NOT EXISTS governance_download_live_alert_acks_v61 (
  ack_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_governance_download_live_alert_acks_v61_actor (actor_id),
  INDEX idx_governance_download_live_alert_acks_v61_created_at (created_at)
) COMMENT='v61 governance alert ack';

CREATE TABLE IF NOT EXISTS governance_download_live_alert_closures_v61 (
  closure_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_governance_download_live_alert_closures_v61_actor (actor_id),
  INDEX idx_governance_download_live_alert_closures_v61_created_at (created_at)
) COMMENT='v61 governance alert closure';

CREATE TABLE IF NOT EXISTS governance_rbac_watermark_tests_v61 (
  test_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_governance_rbac_watermark_tests_v61_actor (actor_id),
  INDEX idx_governance_rbac_watermark_tests_v61_created_at (created_at)
) COMMENT='v61 governance RBAC watermark test';

CREATE TABLE IF NOT EXISTS governance_audit_export_signoffs_v61 (
  signoff_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_governance_audit_export_signoffs_v61_actor (actor_id),
  INDEX idx_governance_audit_export_signoffs_v61_created_at (created_at)
) COMMENT='v61 governance audit export signoff';

CREATE TABLE IF NOT EXISTS operations_live_notification_sends_v61 (
  send_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_operations_live_notification_sends_v61_actor (actor_id),
  INDEX idx_operations_live_notification_sends_v61_created_at (created_at)
) COMMENT='v61 operations live notification send';

CREATE TABLE IF NOT EXISTS operations_live_notification_acks_v61 (
  ack_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_operations_live_notification_acks_v61_actor (actor_id),
  INDEX idx_operations_live_notification_acks_v61_created_at (created_at)
) COMMENT='v61 operations notification ack';

CREATE TABLE IF NOT EXISTS operations_live_notification_escalations_v61 (
  escalation_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_operations_live_notification_escalations_v61_actor (actor_id),
  INDEX idx_operations_live_notification_escalations_v61_created_at (created_at)
) COMMENT='v61 operations notification escalation';

CREATE TABLE IF NOT EXISTS operations_live_notification_closures_v61 (
  closure_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_operations_live_notification_closures_v61_actor (actor_id),
  INDEX idx_operations_live_notification_closures_v61_created_at (created_at)
) COMMENT='v61 operations notification closure';

CREATE TABLE IF NOT EXISTS operations_weekly_review_tasks_v61 (
  task_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_operations_weekly_review_tasks_v61_actor (actor_id),
  INDEX idx_operations_weekly_review_tasks_v61_created_at (created_at)
) COMMENT='v61 operations weekly review task';
