-- 026_vps_actual_ops_v29.sql
-- Initial v29 dashboard panels and route coverage. Does not publish new cultural claims.

INSERT INTO live_dashboard_panels_v29 (panel_key, title, api_path, required_scope, status, last_snapshot_json)
VALUES
('vps_readiness', 'VPS Readiness', '/api/ops/vps/v29/readiness', 'ops:read', 'ready', JSON_OBJECT('mode','vps-db')),
('full_corpus_runs', 'Full Corpus Runs', '/api/admin/corpus/v29/runs', 'corpus:read', 'warning', JSON_OBJECT('embedded_preview_entries',80,'required_min_entries',1000)),
('search_population_runs', 'Search Population Runs', '/api/ops/search/v29/population-runs', 'search:read', 'ready', JSON_OBJECT('target','search_index_documents_v27')),
('fallback_route_coverage', 'Fallback Route Coverage', '/api/ops/fallback/v29/route-coverage', 'security:read', 'warning', JSON_OBJECT('needs_runtime_audit',true)),
('backup_restore_checksum', 'Backup Restore Checksum', '/api/ops/vps-db/v29/backup-restore-checksum', 'ops:read', 'warning', JSON_OBJECT('needs_first_drill',true))
ON DUPLICATE KEY UPDATE title=VALUES(title), api_path=VALUES(api_path), status=VALUES(status);

INSERT INTO fallback_route_coverage_v29 (route_group, fallback_policy, production_covered, middleware_name, finding_json)
VALUES
('/api/public/knowledge/*', 'db_required', false, 'productionDbFallbackV28', JSON_OBJECT('action','audit and wire middleware')),
('/api/public/content/*', 'db_required', false, 'productionDbFallbackV28', JSON_OBJECT('action','audit and wire middleware')),
('/api/admin/*', 'db_required', false, 'adminSessionV26', JSON_OBJECT('action','ensure DB-backed admin session')),
('/api/internal/*', 'db_required', true, 'internalHmacV26', JSON_OBJECT('action','HMAC/nonce required'))
ON DUPLICATE KEY UPDATE fallback_policy=VALUES(fallback_policy), production_covered=VALUES(production_covered), middleware_name=VALUES(middleware_name);

INSERT INTO full_corpus_execution_runs_v29 (run_key, environment, min_entries, status, total_entries, audio_asset_count, source_phon_count, duplicate_count, license_blocker_count, forbidden_relation_hits, dialect_counts_json, report_json)
VALUES
('v29-embedded-preview-honest-failure', 'development', 1000, 'failed', 80, 80, 80, 0, 0, 0,
 JSON_OBJECT('Nanwang_Puyuma',20,'Zhiben_Puyuma',20,'Xiqun_Puyuma',20,'Jianhe_Puyuma',20),
 JSON_OBJECT('reason','embedded preview subset is below required 1000; run on VPS staging'))
ON DUPLICATE KEY UPDATE status=VALUES(status), total_entries=VALUES(total_entries), report_json=VALUES(report_json);
