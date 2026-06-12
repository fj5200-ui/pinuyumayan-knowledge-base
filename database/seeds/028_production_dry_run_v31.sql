INSERT INTO admin_live_dashboard_events_v31 (panel_key, event_type, severity, payload_json)
VALUES
('cutover_readiness', 'v31_layer_installed', 'info', JSON_OBJECT('version','v31','actual_vps_run',false)),
('full_corpus_runs', 'preview_corpus_truth', 'warning', JSON_OBJECT('total_entries',80,'required_min_entries',1000,'status','failed_preview_only'));
