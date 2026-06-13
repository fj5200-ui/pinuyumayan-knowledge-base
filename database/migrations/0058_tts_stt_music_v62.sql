-- v62 TTS/STT Music final ledger write, immutable dataset release, search weekly backfill, metadata public evidence, governance delivery audit, operations delivery seal report

CREATE TABLE IF NOT EXISTS release_final_ledger_entries_v62 (
  ledger_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_release_final_ledger_entries_v62_actor (actor_id),
  INDEX idx_release_final_ledger_entries_v62_created_at (created_at)
) COMMENT='v62 final ledger entries';

CREATE TABLE IF NOT EXISTS release_real_dns_cloudflare_snapshots_v62 (
  snapshot_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_release_real_dns_cloudflare_snapshots_v62_actor (actor_id),
  INDEX idx_release_real_dns_cloudflare_snapshots_v62_created_at (created_at)
) COMMENT='v62 real DNS Cloudflare snapshots';

CREATE TABLE IF NOT EXISTS release_real_restore_rollback_evidence_v62 (
  evidence_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_release_real_restore_rollback_evidence_v62_actor (actor_id),
  INDEX idx_release_real_restore_rollback_evidence_v62_created_at (created_at)
) COMMENT='v62 restore rollback evidence';

CREATE TABLE IF NOT EXISTS release_real_observation_windows_v62 (
  window_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_release_real_observation_windows_v62_actor (actor_id),
  INDEX idx_release_real_observation_windows_v62_created_at (created_at)
) COMMENT='v62 real observation windows';

CREATE TABLE IF NOT EXISTS release_final_audit_samples_v62 (
  sample_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_release_final_audit_samples_v62_actor (actor_id),
  INDEX idx_release_final_audit_samples_v62_created_at (created_at)
) COMMENT='v62 final audit samples';

CREATE TABLE IF NOT EXISTS release_certificate_final_statuses_v62 (
  status_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_release_certificate_final_statuses_v62_actor (actor_id),
  INDEX idx_release_certificate_final_statuses_v62_created_at (created_at)
) COMMENT='v62 release final status';

CREATE TABLE IF NOT EXISTS legal_speech_real_output_batches_v62 (
  batch_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_real_output_batches_v62_actor (actor_id),
  INDEX idx_legal_speech_real_output_batches_v62_created_at (created_at)
) COMMENT='v62 legal speech real output batch';

CREATE TABLE IF NOT EXISTS legal_speech_train_dev_test_exports_v62 (
  export_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_train_dev_test_exports_v62_actor (actor_id),
  INDEX idx_legal_speech_train_dev_test_exports_v62_created_at (created_at)
) COMMENT='v62 legal train dev test export';

CREATE TABLE IF NOT EXISTS legal_speech_dataset_hash_locks_v62 (
  lock_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_dataset_hash_locks_v62_actor (actor_id),
  INDEX idx_legal_speech_dataset_hash_locks_v62_created_at (created_at)
) COMMENT='v62 dataset hash lock';

CREATE TABLE IF NOT EXISTS legal_speech_model_card_releases_v62 (
  model_card_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_model_card_releases_v62_actor (actor_id),
  INDEX idx_legal_speech_model_card_releases_v62_created_at (created_at)
) COMMENT='v62 model card release';

CREATE TABLE IF NOT EXISTS legal_speech_blocked_reports_v62 (
  report_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_legal_speech_blocked_reports_v62_actor (actor_id),
  INDEX idx_legal_speech_blocked_reports_v62_created_at (created_at)
) COMMENT='v62 blocked report';

CREATE TABLE IF NOT EXISTS search_weekly_operations_reports_v62 (
  report_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_search_weekly_operations_reports_v62_actor (actor_id),
  INDEX idx_search_weekly_operations_reports_v62_created_at (created_at)
) COMMENT='v62 search weekly operations report';

CREATE TABLE IF NOT EXISTS search_sla_tasks_v62 (
  task_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_search_sla_tasks_v62_actor (actor_id),
  INDEX idx_search_sla_tasks_v62_created_at (created_at)
) COMMENT='v62 search SLA task';

CREATE TABLE IF NOT EXISTS search_rollback_drill_results_v62 (
  drill_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_search_rollback_drill_results_v62_actor (actor_id),
  INDEX idx_search_rollback_drill_results_v62_created_at (created_at)
) COMMENT='v62 search rollback drill';

CREATE TABLE IF NOT EXISTS search_quality_regression_results_v62 (
  test_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_search_quality_regression_results_v62_actor (actor_id),
  INDEX idx_search_quality_regression_results_v62_created_at (created_at)
) COMMENT='v62 search quality regression result';

CREATE TABLE IF NOT EXISTS authority_public_expansion_records_v62 (
  record_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_authority_public_expansion_records_v62_actor (actor_id),
  INDEX idx_authority_public_expansion_records_v62_created_at (created_at)
) COMMENT='v62 authority public expansion record';

CREATE TABLE IF NOT EXISTS authority_public_citation_screenshots_v62 (
  evidence_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_authority_public_citation_screenshots_v62_actor (actor_id),
  INDEX idx_authority_public_citation_screenshots_v62_created_at (created_at)
) COMMENT='v62 authority citation screenshot';

CREATE TABLE IF NOT EXISTS authority_public_sitemap_og_evidence_v62 (
  evidence_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_authority_public_sitemap_og_evidence_v62_actor (actor_id),
  INDEX idx_authority_public_sitemap_og_evidence_v62_created_at (created_at)
) COMMENT='v62 sitemap OG evidence';

CREATE TABLE IF NOT EXISTS authority_public_takedown_rehearsals_v62 (
  evidence_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_authority_public_takedown_rehearsals_v62_actor (actor_id),
  INDEX idx_authority_public_takedown_rehearsals_v62_created_at (created_at)
) COMMENT='v62 takedown rehearsal evidence';

CREATE TABLE IF NOT EXISTS authority_public_source_drift_snapshots_v62 (
  snapshot_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_authority_public_source_drift_snapshots_v62_actor (actor_id),
  INDEX idx_authority_public_source_drift_snapshots_v62_created_at (created_at)
) COMMENT='v62 source drift snapshot';

CREATE TABLE IF NOT EXISTS governance_download_live_alerts_v62 (
  alert_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_governance_download_live_alerts_v62_actor (actor_id),
  INDEX idx_governance_download_live_alerts_v62_created_at (created_at)
) COMMENT='v62 governance live download alert';

CREATE TABLE IF NOT EXISTS governance_download_live_alert_acks_v62 (
  ack_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_governance_download_live_alert_acks_v62_actor (actor_id),
  INDEX idx_governance_download_live_alert_acks_v62_created_at (created_at)
) COMMENT='v62 governance alert ack';

CREATE TABLE IF NOT EXISTS governance_download_live_alert_closures_v62 (
  closure_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_governance_download_live_alert_closures_v62_actor (actor_id),
  INDEX idx_governance_download_live_alert_closures_v62_created_at (created_at)
) COMMENT='v62 governance alert closure';

CREATE TABLE IF NOT EXISTS governance_rbac_watermark_tests_v62 (
  test_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_governance_rbac_watermark_tests_v62_actor (actor_id),
  INDEX idx_governance_rbac_watermark_tests_v62_created_at (created_at)
) COMMENT='v62 governance RBAC watermark test';

CREATE TABLE IF NOT EXISTS governance_audit_export_signoffs_v62 (
  signoff_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_governance_audit_export_signoffs_v62_actor (actor_id),
  INDEX idx_governance_audit_export_signoffs_v62_created_at (created_at)
) COMMENT='v62 governance audit export signoff';

CREATE TABLE IF NOT EXISTS operations_live_notification_sends_v62 (
  send_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_operations_live_notification_sends_v62_actor (actor_id),
  INDEX idx_operations_live_notification_sends_v62_created_at (created_at)
) COMMENT='v62 operations live notification send';

CREATE TABLE IF NOT EXISTS operations_live_notification_acks_v62 (
  ack_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_operations_live_notification_acks_v62_actor (actor_id),
  INDEX idx_operations_live_notification_acks_v62_created_at (created_at)
) COMMENT='v62 operations notification ack';

CREATE TABLE IF NOT EXISTS operations_live_notification_escalations_v62 (
  escalation_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_operations_live_notification_escalations_v62_actor (actor_id),
  INDEX idx_operations_live_notification_escalations_v62_created_at (created_at)
) COMMENT='v62 operations notification escalation';

CREATE TABLE IF NOT EXISTS operations_live_notification_closures_v62 (
  closure_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_operations_live_notification_closures_v62_actor (actor_id),
  INDEX idx_operations_live_notification_closures_v62_created_at (created_at)
) COMMENT='v62 operations notification closure';

CREATE TABLE IF NOT EXISTS operations_weekly_review_tasks_v62 (
  task_id VARCHAR(96) PRIMARY KEY,
  actor_id VARCHAR(96) NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'recorded',
  event_json JSON NOT NULL,
  previous_hash CHAR(64) NULL,
  current_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_operations_weekly_review_tasks_v62_actor (actor_id),
  INDEX idx_operations_weekly_review_tasks_v62_created_at (created_at)
) COMMENT='v62 operations weekly review task';
