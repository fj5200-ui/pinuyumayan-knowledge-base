-- 024_vps_full_corpus_search_backup_v27.sql
-- v27 seed rows for VPS staging acceptance, production fallback policy, search, and backup drill operations.

INSERT INTO full_corpus_import_jobs_v27 (job_key, environment, min_entries_required, status, command_text)
VALUES
('v27-staging-full-corpus-first-run', 'staging', 1000, 'queued', 'python3 scripts/build_full_puyuma_web_vocabulary.py --download --min-entries 1000')
ON DUPLICATE KEY UPDATE min_entries_required=VALUES(min_entries_required), command_text=VALUES(command_text);

INSERT INTO source_candidate_ingestion_runs_v27 (run_key, adapter_key, status, candidate_count, blocked_count, output_file, notes)
VALUES
('v27-source-candidate-bootstrap', 'candidate_registry', 'completed', 6, 1, 'data/sources/source_candidate_adapters_v27.json', 'Candidate adapters are registered but not auto-published.')
ON DUPLICATE KEY UPDATE status=VALUES(status), candidate_count=VALUES(candidate_count), blocked_count=VALUES(blocked_count), output_file=VALUES(output_file), notes=VALUES(notes);

INSERT INTO admin_ui_integration_checks_v27 (page_key, api_path, status, detail_json)
VALUES
('admin_login', 'POST /api/admin/auth/v26/login', 'wired', JSON_OBJECT('component','webapp/components/AdminLoginV27.tsx')),
('admin_articles_review', 'POST /api/admin/articles/v26/review-action', 'wired', JSON_OBJECT('component','webapp/components/AdminArticleReviewWorkbenchV27.tsx')),
('admin_corpus_acceptance', 'GET /api/admin/corpus/v27/acceptance-latest', 'wired', JSON_OBJECT('component','webapp/components/FullCorpusAcceptancePanelV27.tsx')),
('admin_search_ops', 'GET /api/ops/search/v27/index-status', 'wired', JSON_OBJECT('component','webapp/components/SearchOpsPanelV27.tsx'))
ON DUPLICATE KEY UPDATE status=VALUES(status), detail_json=VALUES(detail_json);
