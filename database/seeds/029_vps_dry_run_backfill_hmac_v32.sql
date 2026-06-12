INSERT INTO vps_dry_run_backfill_runs_v32 (run_id, environment, status, actual_vps_run, report_sha256, blockers_json, report_json)
VALUES ('v32-preview-not-vps-run', 'preview', 'missing_actual_vps_evidence', FALSE,
'0000000000000000000000000000000000000000000000000000000000000000', JSON_ARRAY('actual_vps_run_false'),
JSON_OBJECT('version','v32','actual_vps_run',false,'note','Preview row only. Replace by POSTing generated VPS dry-run report.'))
ON DUPLICATE KEY UPDATE status=VALUES(status), report_json=VALUES(report_json);

INSERT INTO full_corpus_backfill_reports_v32 (report_id, total_entries, required_min_entries, audio_coverage_ratio, source_phon_coverage_ratio, status, report_json)
VALUES ('v32-preview-80-below-1000', 80, 1000, 1.00000, NULL, 'failed_below_min_entries',
JSON_OBJECT('version','v32','total_entries',80,'required_min_entries',1000,'status','failed','reason','preview subset is not the full corpus'))
ON DUPLICATE KEY UPDATE status=VALUES(status), report_json=VALUES(report_json);
