#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
release=json.loads((root/'data/deployment/production_final_ledger_v62.json').read_text(encoding='utf-8'))
dataset=json.loads((root/'data/security/legal_speech_dataset_real_output_v62.json').read_text(encoding='utf-8'))
search=json.loads((root/'data/search/music_search_weekly_operations_v62.json').read_text(encoding='utf-8'))
auth=json.loads((root/'data/integration/authority_metadata_public_expansion_v62.json').read_text(encoding='utf-8'))
gov=json.loads((root/'data/audio/speech_governance_alert_live_test_v62.json').read_text(encoding='utf-8'))
ops=json.loads((root/'data/site/operations_notification_delivery_seal_v62.json').read_text(encoding='utf-8'))
assert len(release.get('checks',[])) == 6, 'v62 release checks must be 6'
assert len(dataset.get('assets',[])) == 20, 'v62 dataset candidates must be 20'
assert dataset.get('summary',{}).get('train_rows') == 0, 'v62 must not fake train rows without real evidence'
assert len(search.get('features',[])) == 3, 'v62 search features must be 3'
assert len(auth.get('records',[])) >= 12, 'v62 authority public expansion should have at least 12 records'
assert len(gov.get('artifacts',[])) >= 8, 'v62 governance artifacts should have at least 8 records'
assert len(ops.get('jobs',[])) == 6, 'v62 ops delivery seal jobs must be 6'
for table in ["release_final_ledger_entries_v62", "release_real_dns_cloudflare_snapshots_v62", "release_real_restore_rollback_evidence_v62", "release_real_observation_windows_v62", "release_final_audit_samples_v62", "release_certificate_final_statuses_v62", "legal_speech_real_output_batches_v62", "legal_speech_train_dev_test_exports_v62", "legal_speech_dataset_hash_locks_v62", "legal_speech_model_card_releases_v62", "legal_speech_blocked_reports_v62", "search_weekly_operations_reports_v62", "search_sla_tasks_v62", "search_rollback_drill_results_v62", "search_quality_regression_results_v62", "authority_public_expansion_records_v62", "authority_public_citation_screenshots_v62", "authority_public_sitemap_og_evidence_v62", "authority_public_takedown_rehearsals_v62", "authority_public_source_drift_snapshots_v62", "governance_download_live_alerts_v62", "governance_download_live_alert_acks_v62", "governance_download_live_alert_closures_v62", "governance_rbac_watermark_tests_v62", "governance_audit_export_signoffs_v62", "operations_live_notification_sends_v62", "operations_live_notification_acks_v62", "operations_live_notification_escalations_v62", "operations_live_notification_closures_v62", "operations_weekly_review_tasks_v62"]:
    if table not in (root/'database/migrations/0058_tts_stt_music_v62.sql').read_text(encoding='utf-8'):
        raise SystemExit(f'migration missing {table}')
route=(root/'backend/src/rest/ttsSttMusicV62Routes.ts').read_text(encoding='utf-8')
for snippet in ['append-final-ledger-entry','create-real-output-batch','write-weekly-operations-report','record-public-expansion','record-live-download-alert','record-live-notification-send','beginTransaction','rollback','commit']:
    if snippet not in route: raise SystemExit(f'v62 route missing {snippet}')
server=(root/'backend/src/server.ts').read_text(encoding='utf-8')
if 'registerTtsSttMusicV62Routes' not in server: raise SystemExit('server not registering v62 routes')
api=json.loads((root/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
for path in ["/api/admin/music-speech/v62/review-center", "/api/ops/vps/v62/final-ledger", "/api/admin/speech-training/v62/real-output", "/api/ops/search/music/v62/weekly-operations", "/api/ops/authority-sources/v62/public-expansion", "/api/ops/speech-training/v62/governance-alert-live-test", "/api/ops/site/v62/delivery-seal", "/api/ops/vps/v62/preflight-contract", "/api/ops/next-upgrade-plan/v63", "/api/internal/vps/v62/append-final-ledger-entry", "/api/internal/vps/v62/record-real-dns-cloudflare-snapshot", "/api/internal/vps/v62/record-real-restore-rollback-evidence", "/api/internal/vps/v62/record-real-observation-window", "/api/internal/vps/v62/record-final-audit-sample", "/api/internal/vps/v62/mark-release-final-status", "/api/internal/speech-training/v62/create-real-output-batch", "/api/internal/speech-training/v62/export-real-train-dev-test", "/api/internal/speech-training/v62/lock-dataset-hash", "/api/internal/speech-training/v62/release-model-card", "/api/internal/speech-training/v62/write-blocked-report", "/api/internal/search/music/v62/write-weekly-operations-report", "/api/internal/search/music/v62/create-sla-task", "/api/internal/search/music/v62/record-rollback-drill-result", "/api/internal/search/music/v62/record-quality-regression-result", "/api/internal/authority/v62/record-public-expansion", "/api/internal/authority/v62/seal-citation-screenshot", "/api/internal/authority/v62/seal-sitemap-og-evidence", "/api/internal/authority/v62/seal-takedown-rehearsal", "/api/internal/authority/v62/seal-source-drift-snapshot", "/api/internal/governance/v62/record-live-download-alert", "/api/internal/governance/v62/ack-live-download-alert", "/api/internal/governance/v62/close-live-download-alert", "/api/internal/governance/v62/record-rbac-watermark-test", "/api/internal/governance/v62/signoff-audit-export", "/api/internal/ops/v62/record-live-notification-send", "/api/internal/ops/v62/ack-live-notification", "/api/internal/ops/v62/escalate-live-notification", "/api/internal/ops/v62/close-live-notification", "/api/internal/ops/v62/create-weekly-review-task"]:
    if path not in api.get('paths',{}): raise SystemExit(f'OpenAPI missing {path}')
if len(api.get('paths',{})) < 910: raise SystemExit('OpenAPI path count did not increase enough for v62')
plan=json.loads((root/'data/development/next_upgrade_plan_v63.json').read_text(encoding='utf-8'))
if len(plan.get('items',[])) != 6: raise SystemExit('v63 plan must include 6 items')
print(f"tts/stt music v62 OK: {len(dataset.get('assets',[]))} dataset candidates, {len(release.get('checks',[]))} final ledger checks, {len(search.get('features',[]))} search features, {len(auth.get('records',[]))} metadata records, {len(ops.get('jobs',[]))} delivery jobs, {len(api.get('paths',{}))} OpenAPI paths")
