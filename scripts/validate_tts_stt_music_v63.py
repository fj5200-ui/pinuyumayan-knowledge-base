#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
release=json.loads((root/'data/deployment/release_ledger_final_certificate_v63.json').read_text(encoding='utf-8'))
dataset=json.loads((root/'data/security/legal_speech_dataset_immutable_release_v63.json').read_text(encoding='utf-8'))
search=json.loads((root/'data/search/music_search_weekly_improvement_loop_v63.json').read_text(encoding='utf-8'))
auth=json.loads((root/'data/integration/authority_metadata_public_evidence_v63.json').read_text(encoding='utf-8'))
gov=json.loads((root/'data/audio/speech_governance_audit_delivery_v63.json').read_text(encoding='utf-8'))
ops=json.loads((root/'data/site/operations_delivery_audit_rhythm_v63.json').read_text(encoding='utf-8'))
assert len(release.get('checks',[])) == 6, 'v63 final certificate checks must be 6'
assert len(dataset.get('assets',[])) == 20, 'v63 dataset candidates must be 20'
assert dataset.get('summary',{}).get('train_rows') == 0, 'v63 must not fake train rows without real evidence'
assert len(search.get('features',[])) == 3, 'v63 search features must be 3'
assert len(auth.get('records',[])) >= 20, 'v63 authority public evidence should have at least 20 records'
assert len(gov.get('artifacts',[])) >= 10, 'v63 governance artifacts should have at least 10 records'
assert len(ops.get('jobs',[])) == 6, 'v63 ops delivery audit rhythm jobs must be 6'
for table in ["release_final_ledger_entries_v63", "release_final_dns_cloudflare_evidence_v63", "release_final_restore_rollback_evidence_v63", "release_final_observation_windows_v63", "release_final_audit_samples_v63", "release_certificate_final_signoffs_v63", "legal_speech_immutable_release_batches_v63", "legal_speech_immutable_train_dev_test_exports_v63", "legal_speech_immutable_hash_locks_v63", "legal_speech_immutable_model_cards_v63", "legal_speech_immutable_blocked_reports_v63", "search_weekly_improvement_reports_v63", "search_weekly_improvement_sla_tasks_v63", "search_weekly_improvement_rollback_drills_v63", "search_weekly_improvement_regressions_v63", "search_weekly_improvement_tasks_v63", "authority_public_evidence_records_v63", "authority_public_evidence_citation_screenshots_v63", "authority_public_evidence_sitemap_og_v63", "authority_public_evidence_takedown_rehearsals_v63", "authority_public_evidence_source_drift_v63", "governance_delivery_download_alerts_v63", "governance_delivery_alert_acks_v63", "governance_delivery_alert_closures_v63", "governance_delivery_rbac_watermark_tests_v63", "governance_delivery_audit_export_signoffs_v63", "operations_audit_notification_sends_v63", "operations_audit_notification_acks_v63", "operations_audit_notification_escalations_v63", "operations_audit_notification_closures_v63", "operations_audit_weekly_improvement_tasks_v63"]:
    if table not in (root/'database/migrations/0059_tts_stt_music_v63.sql').read_text(encoding='utf-8'):
        raise SystemExit(f'migration missing {table}')
route=(root/'backend/src/rest/ttsSttMusicV63Routes.ts').read_text(encoding='utf-8')
for snippet in ['append-final-certificate-ledger-entry','create-immutable-release-batch','write-weekly-improvement-report','record-public-evidence','record-delivery-download-alert','record-audit-notification-send','beginTransaction','rollback','commit']:
    if snippet not in route: raise SystemExit(f'v63 route missing {snippet}')
server=(root/'backend/src/server.ts').read_text(encoding='utf-8')
if 'registerTtsSttMusicV63Routes' not in server: raise SystemExit('server not registering v63 routes')
api=json.loads((root/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
for path in ["/api/admin/music-speech/v63/review-center", "/api/ops/vps/v63/final-certificate", "/api/admin/speech-training/v63/immutable-release", "/api/ops/search/music/v63/weekly-improvement-loop", "/api/ops/authority-sources/v63/public-evidence", "/api/ops/speech-training/v63/governance-delivery-audit", "/api/ops/site/v63/audit-rhythm", "/api/ops/vps/v63/preflight-contract", "/api/ops/next-upgrade-plan/v64", "/api/internal/vps/v63/append-final-certificate-ledger-entry", "/api/internal/speech-training/v63/create-immutable-release-batch", "/api/internal/search/music/v63/write-weekly-improvement-report", "/api/internal/authority/v63/record-public-evidence", "/api/internal/governance/v63/record-delivery-download-alert", "/api/internal/ops/v63/record-audit-notification-send"]:
    if path not in api.get('paths',{}): raise SystemExit(f'OpenAPI missing {path}')
if len(api.get('paths',{})) < 950: raise SystemExit('OpenAPI path count did not increase enough for v63')
plan=json.loads((root/'data/development/next_upgrade_plan_v64.json').read_text(encoding='utf-8'))
if len(plan.get('items',[])) != 6: raise SystemExit('v64 plan must include 6 items')
print(f"tts/stt music v63 OK: {len(dataset.get('assets',[]))} dataset candidates, {len(release.get('checks',[]))} final certificate checks, {len(search.get('features',[]))} search features, {len(auth.get('records',[]))} metadata records, {len(ops.get('jobs',[]))} delivery jobs, {len(api.get('paths',{}))} OpenAPI paths")
