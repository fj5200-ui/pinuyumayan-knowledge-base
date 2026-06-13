-- v48 aggregate seed
INSERT IGNORE INTO vps_db_validation_reports_v48 (report_id, run_mode, status, checks_total, checks_passed, checks_failed, report_json) VALUES ('v48-contract-report','contract_only','contract_ready',8,0,0,CAST('{"source":"seed"}' AS JSON));
