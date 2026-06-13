#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
required=[
 'data/database/vps_release_validation_report_v49.json','data/admin/speech_review_workbench_live_api_v49.json','data/search/music_search_auto_optimization_v49.json','data/integration/authority_citation_completeness_v49.json','data/audio/speech_model_governance_export_v49.json','data/site/main_site_design_system_performance_v49.json','data/admin/music_speech_review_center_v49.json','data/ops/vps_preflight_v49.json','data/development/next_upgrade_plan_v50.json',
 'backend/src/rest/ttsSttMusicV49Routes.ts','frontend-sdk/ttsSttMusicClient.v49.ts','webapp/components/MusicSpeechReviewCenterV49.tsx','webapp/app/admin/music-speech/v49/page.tsx','database/migrations/0045_tts_stt_music_v49.sql','database/seeds/045_tts_stt_music_v49.sql','database/seeds/045_vps_release_validation_v49.generated.sql','database/seeds/045_review_workbench_live_v49.generated.sql','database/seeds/045_search_auto_optimization_v49.generated.sql','database/seeds/045_authority_citation_v49.generated.sql','database/seeds/045_model_governance_export_v49.generated.sql','database/seeds/045_site_design_performance_v49.generated.sql','deploy/vps-tts-stt-v49.sh','docs/tts_stt_music_v49.md','docs/model_governance_report_v49.generated.md','docs/next_upgrade_plan_v50.md'
]
missing=[p for p in required if not (root/p).exists()]
if missing: raise SystemExit('missing required v49 files: '+', '.join(missing))
vps=json.loads((root/'data/database/vps_release_validation_report_v49.json').read_text(encoding='utf-8'))
if len(vps.get('checks',[])) < 10 or vps.get('summary',{}).get('release_allowed_without_db_tests') is not False: raise SystemExit('v49 VPS validation invalid')
wb=json.loads((root/'data/admin/speech_review_workbench_live_api_v49.json').read_text(encoding='utf-8'))
if len(wb.get('items',[])) != 80 or not wb.get('summary',{}).get('real_api_bound'): raise SystemExit('v49 live workbench invalid')
if wb.get('summary',{}).get('bulk_approve_allowed') is not False: raise SystemExit('v49 bulk approve must be blocked')
search=json.loads((root/'data/search/music_search_auto_optimization_v49.json').read_text(encoding='utf-8'))
if len(search.get('synonym_suggestions',[])) < 3 or len(search.get('regression_tests',[])) < 3: raise SystemExit('v49 search optimization invalid')
if search.get('summary',{}).get('auto_apply_allowed') is not False: raise SystemExit('v49 search suggestions must not auto apply')
auth=json.loads((root/'data/integration/authority_citation_completeness_v49.json').read_text(encoding='utf-8'))
if len(auth.get('citation_scores',[])) < 3 or auth.get('summary',{}).get('auto_public_allowed') is not False: raise SystemExit('v49 authority citation invalid')
model=json.loads((root/'data/audio/speech_model_governance_export_v49.json').read_text(encoding='utf-8'))
if model.get('summary',{}).get('blocked_assets') != 80 or model.get('summary',{}).get('public_release_allowed') is not False: raise SystemExit('v49 model export must remain blocked')
site=json.loads((root/'data/site/main_site_design_system_performance_v49.json').read_text(encoding='utf-8'))
if site.get('summary',{}).get('minimum_contrast') != 'WCAG AA' or len(site.get('route_validations',[])) < 6: raise SystemExit('v49 site design invalid')
migration=(root/'database/migrations/0045_tts_stt_music_v49.sql').read_text(encoding='utf-8')
for table in ['vps_release_validation_runs_v49','vps_release_validation_checks_v49','vps_backup_restore_drills_v49','speech_review_workbench_live_views_v49','speech_review_workbench_live_actions_v49','speech_review_attachment_scan_jobs_v49','speech_review_batch_progress_v49','music_search_synonym_suggestions_v49','music_search_zero_result_tasks_v49','music_search_regression_runs_v49','authority_citation_completeness_scores_v49','authority_rights_statement_diffs_v49','authority_source_change_events_v49','speech_model_governance_exports_v49','speech_model_release_blocker_summaries_v49','site_design_system_tokens_v49','site_performance_validation_runs_v49','site_og_screenshot_validations_v49']:
    if table not in migration: raise SystemExit(f'v49 migration missing {table}')
route=(root/'backend/src/rest/ttsSttMusicV49Routes.ts').read_text(encoding='utf-8')
for snippet in ['record-release-validation','record-backup-restore-drill','live-workbench','workbench-action','attachment-scan-status','batch-progress','auto-optimization','apply-synonym-suggestion','record-regression-run','citation-completeness','approve-metadata-only','source-change-event','governance-export','export-model-governance','design-system-performance','record-performance-validation','record-og-screenshot-validation','beginTransaction','rollback()','commit()']:
    if snippet not in route: raise SystemExit(f'v49 route missing {snippet}')
server=(root/'backend/src/server.ts').read_text(encoding='utf-8')
if 'registerTtsSttMusicV49Routes' not in server: raise SystemExit('server not registering v49 routes')
api=json.loads((root/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
for path in ['/api/admin/music-speech/v49/review-center','/api/ops/vps/v49/release-validation-report','/api/internal/vps/v49/record-release-validation','/api/internal/vps/v49/record-backup-restore-drill','/api/admin/music-speech/v49/live-workbench','/api/internal/speech-training/v49/workbench-action','/api/internal/speech-training/v49/attachment-scan-status','/api/internal/speech-training/v49/batch-progress','/api/ops/search/music/v49/auto-optimization','/api/internal/search/music/v49/apply-synonym-suggestion','/api/internal/search/music/v49/record-regression-run','/api/ops/authority-sources/v49/citation-completeness','/api/internal/authority-sources/v49/approve-metadata-only','/api/internal/authority-sources/v49/source-change-event','/api/ops/speech-training/v49/governance-export','/api/internal/speech-training/v49/export-model-governance','/api/ops/site/v49/design-system-performance','/api/internal/site/v49/record-performance-validation','/api/internal/site/v49/record-og-screenshot-validation','/api/ops/vps/v49/preflight-contract','/api/ops/next-upgrade-plan/v50']:
    if path not in api.get('paths',{}): raise SystemExit(f'OpenAPI missing {path}')
if len(api.get('paths',{})) < 466: raise SystemExit('OpenAPI path count did not increase enough for v49')
plan=json.loads((root/'data/development/next_upgrade_plan_v50.json').read_text(encoding='utf-8'))
if len(plan.get('items',[])) != 6: raise SystemExit('v50 plan must include 6 items')
print(f"tts/stt music v49 OK: {len(wb.get('items',[]))} live rows, {len(search.get('synonym_suggestions',[]))} synonym suggestions, {len(auth.get('citation_scores',[]))} citation scores, {len(site.get('route_validations',[]))} site routes, {len(api.get('paths',{}))} OpenAPI paths")
