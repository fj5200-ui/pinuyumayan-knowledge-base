#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
release=json.loads((root/'data/deployment/production_final_ledger_v61.json').read_text(encoding='utf-8'))
dataset=json.loads((root/'data/security/legal_speech_dataset_real_output_v61.json').read_text(encoding='utf-8'))
search=json.loads((root/'data/search/music_search_weekly_operations_v61.json').read_text(encoding='utf-8'))
auth=json.loads((root/'data/integration/authority_metadata_public_expansion_v61.json').read_text(encoding='utf-8'))
gov=json.loads((root/'data/audio/speech_governance_alert_live_test_v61.json').read_text(encoding='utf-8'))
ops=json.loads((root/'data/site/operations_notification_delivery_seal_v61.json').read_text(encoding='utf-8'))
assert len(release.get('checks',[])) == 6, 'v61 release checks must be 6'
assert len(dataset.get('assets',[])) == 20, 'v61 dataset candidates must be 20'
assert dataset.get('summary',{}).get('train_rows') == 0, 'v61 must not fake train rows without real evidence'
assert len(search.get('features',[])) == 3, 'v61 search features must be 3'
assert len(auth.get('records',[])) >= 12, 'v61 authority public expansion should have at least 12 records'
assert len(gov.get('artifacts',[])) >= 8, 'v61 governance artifacts should have at least 8 records'
assert len(ops.get('jobs',[])) == 6, 'v61 ops delivery seal jobs must be 6'
for table in ["release_final_ledger_entries_v61", "release_real_dns_cloudflare_snapshots_v61", "release_real_restore_rollback_evidence_v61", "release_real_observation_windows_v61", "release_final_audit_samples_v61", "release_certificate_final_statuses_v61", "legal_speech_real_output_batches_v61", "legal_speech_train_dev_test_exports_v61", "legal_speech_dataset_hash_locks_v61", "legal_speech_model_card_releases_v61", "legal_speech_blocked_reports_v61", "search_weekly_operations_reports_v61", "search_sla_tasks_v61", "search_rollback_drill_results_v61", "search_quality_regression_results_v61", "authority_public_expansion_records_v61", "authority_public_citation_screenshots_v61", "authority_public_sitemap_og_evidence_v61", "authority_public_takedown_rehearsals_v61", "authority_public_source_drift_snapshots_v61", "governance_download_live_alerts_v61", "governance_download_live_alert_acks_v61", "governance_download_live_alert_closures_v61", "governance_rbac_watermark_tests_v61", "governance_audit_export_signoffs_v61", "operations_live_notification_sends_v61", "operations_live_notification_acks_v61", "operations_live_notification_escalations_v61", "operations_live_notification_closures_v61", "operations_weekly_review_tasks_v61"]:
    if table not in (root/'database/migrations/0057_tts_stt_music_v61.sql').read_text(encoding='utf-8'):
        raise SystemExit(f'migration missing {table}')
route=(root/'backend/src/rest/ttsSttMusicV61Routes.ts').read_text(encoding='utf-8')
for snippet in ['append-final-ledger-entry','create-real-output-batch','write-weekly-operations-report','record-public-expansion','record-live-download-alert','record-live-notification-send','beginTransaction','rollback','commit']:
    if snippet not in route: raise SystemExit(f'v61 route missing {snippet}')
server=(root/'backend/src/server.ts').read_text(encoding='utf-8')
if 'registerTtsSttMusicV61Routes' not in server: raise SystemExit('server not registering v61 routes')
api=json.loads((root/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
for path in ["/api/admin/music-speech/v61/review-center", "/api/ops/vps/v61/final-ledger", "/api/admin/speech-training/v61/real-output", "/api/ops/search/music/v61/weekly-operations", "/api/ops/authority-sources/v61/public-expansion", "/api/ops/speech-training/v61/governance-alert-live-test", "/api/ops/site/v61/delivery-seal", "/api/ops/vps/v61/preflight-contract", "/api/ops/next-upgrade-plan/v62", "/api/internal/vps/v61/append-final-ledger-entry", "/api/internal/vps/v61/record-real-dns-cloudflare-snapshot", "/api/internal/vps/v61/record-real-restore-rollback-evidence", "/api/internal/vps/v61/record-real-observation-window", "/api/internal/vps/v61/record-final-audit-sample", "/api/internal/vps/v61/mark-release-final-status", "/api/internal/speech-training/v61/create-real-output-batch", "/api/internal/speech-training/v61/export-real-train-dev-test", "/api/internal/speech-training/v61/lock-dataset-hash", "/api/internal/speech-training/v61/release-model-card", "/api/internal/speech-training/v61/write-blocked-report", "/api/internal/search/music/v61/write-weekly-operations-report", "/api/internal/search/music/v61/create-sla-task", "/api/internal/search/music/v61/record-rollback-drill-result", "/api/internal/search/music/v61/record-quality-regression-result", "/api/internal/authority/v61/record-public-expansion", "/api/internal/authority/v61/seal-citation-screenshot", "/api/internal/authority/v61/seal-sitemap-og-evidence", "/api/internal/authority/v61/seal-takedown-rehearsal", "/api/internal/authority/v61/seal-source-drift-snapshot", "/api/internal/governance/v61/record-live-download-alert", "/api/internal/governance/v61/ack-live-download-alert", "/api/internal/governance/v61/close-live-download-alert", "/api/internal/governance/v61/record-rbac-watermark-test", "/api/internal/governance/v61/signoff-audit-export", "/api/internal/ops/v61/record-live-notification-send", "/api/internal/ops/v61/ack-live-notification", "/api/internal/ops/v61/escalate-live-notification", "/api/internal/ops/v61/close-live-notification", "/api/internal/ops/v61/create-weekly-review-task"]:
    if path not in api.get('paths',{}): raise SystemExit(f'OpenAPI missing {path}')
if len(api.get('paths',{})) < 870: raise SystemExit('OpenAPI path count did not increase enough for v61')
plan=json.loads((root/'data/development/next_upgrade_plan_v62.json').read_text(encoding='utf-8'))
if len(plan.get('items',[])) != 6: raise SystemExit('v62 plan must include 6 items')
print(f"tts/stt music v61 OK: {len(dataset.get('assets',[]))} dataset candidates, {len(release.get('checks',[]))} final ledger checks, {len(search.get('features',[]))} search features, {len(auth.get('records',[]))} metadata records, {len(ops.get('jobs',[]))} delivery jobs, {len(api.get('paths',{}))} OpenAPI paths")
