#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
required=[
 'data/database/vps_db_validation_report_v48.json','data/admin/speech_review_workbench_v48.json','data/search/music_search_analytics_dashboard_v48.json','data/integration/authority_candidate_merge_v48.json','data/audio/speech_model_visualization_v48.json','data/site/main_site_visual_completion_v48.json','data/admin/music_speech_review_center_v48.json','data/ops/vps_preflight_v48.json','data/development/next_upgrade_plan_v49.json',
 'backend/src/rest/ttsSttMusicV48Routes.ts','frontend-sdk/ttsSttMusicClient.v48.ts','webapp/components/MusicSpeechReviewCenterV48.tsx','database/migrations/0044_tts_stt_music_v48.sql','database/seeds/044_tts_stt_music_v48.sql','database/seeds/044_vps_db_validation_v48.generated.sql','database/seeds/044_review_workbench_v48.generated.sql','database/seeds/044_search_analytics_v48.generated.sql','database/seeds/044_authority_merge_v48.generated.sql','database/seeds/044_model_visualization_v48.generated.sql','database/seeds/044_site_visual_completion_v48.generated.sql','deploy/vps-tts-stt-v48.sh','docs/tts_stt_music_v48.md','docs/next_upgrade_plan_v49.md'
]
missing=[p for p in required if not (root/p).exists()]
if missing: raise SystemExit('missing required v48 files: '+', '.join(missing))
db=json.loads((root/'data/database/vps_db_validation_report_v48.json').read_text(encoding='utf-8'))
if len(db.get('checks',[])) < 8 or not db.get('database_url_required_for_real_run'): raise SystemExit('v48 DB validation report invalid')
if db.get('summary',{}).get('public_release_allowed') is not False: raise SystemExit('v48 DB validation must not allow public release')
wb=json.loads((root/'data/admin/speech_review_workbench_v48.json').read_text(encoding='utf-8'))
if len(wb.get('items',[])) != 80: raise SystemExit('v48 workbench must cover 80 queue rows')
if wb.get('summary',{}).get('bulk_approve_allowed') is not False or not wb.get('summary',{}).get('history_drawer_enabled'): raise SystemExit('v48 workbench safety/history invalid')
analytics=json.loads((root/'data/search/music_search_analytics_dashboard_v48.json').read_text(encoding='utf-8'))
if len(analytics.get('daily_metrics',[])) < 5 or len(analytics.get('zero_result_terms',[])) < 3: raise SystemExit('v48 search analytics missing metrics')
if not analytics.get('summary',{}).get('alert_notification_enabled'): raise SystemExit('v48 search alert notification missing')
auth=json.loads((root/'data/integration/authority_candidate_merge_v48.json').read_text(encoding='utf-8'))
if auth.get('summary',{}).get('candidate_auto_public') is not False or len(auth.get('merge_groups',[])) < 3: raise SystemExit('v48 authority merge invalid')
gov=json.loads((root/'data/audio/speech_model_visualization_v48.json').read_text(encoding='utf-8'))
if gov.get('summary',{}).get('blocked_assets') != 80 or gov.get('summary',{}).get('public_release_allowed') is not False: raise SystemExit('v48 model visualization must remain blocked')
site=json.loads((root/'data/site/main_site_visual_completion_v48.json').read_text(encoding='utf-8'))
if site.get('summary',{}).get('minimum_contrast') != 'WCAG AA' or len(site.get('route_audits',[])) < 6: raise SystemExit('v48 site visual completion invalid')
migration=(root/'database/migrations/0044_tts_stt_music_v48.sql').read_text(encoding='utf-8')
for table in ['vps_db_validation_reports_v48','vps_db_validation_check_results_v48','speech_review_workbench_views_v48','speech_review_bulk_actions_v48','speech_review_history_events_v48','music_search_daily_metrics_v48','music_search_weekly_reports_v48','music_search_alert_notifications_v48','authority_candidate_merge_groups_v48','authority_candidate_merge_decisions_v48','speech_model_visualization_reports_v48','speech_model_export_artifacts_v48','site_visual_audit_results_v48','site_sitemap_ping_runs_v48','core_web_vitals_preflight_v48']:
    if table not in migration: raise SystemExit(f'v48 migration missing {table}')
route=(root/'backend/src/rest/ttsSttMusicV48Routes.ts').read_text(encoding='utf-8')
for snippet in ['run-db-validation','bulk-review-action','review-history-event','aggregate-query-logs','alert-notification','candidate-merge-dashboard','merge-decision','model-visualization','export-governance-artifact','visual-audit-record','sitemap-ping-record','beginTransaction','rollback()','commit()']:
    if snippet not in route: raise SystemExit(f'v48 route missing {snippet}')
server=(root/'backend/src/server.ts').read_text(encoding='utf-8')
if 'registerTtsSttMusicV48Routes' not in server: raise SystemExit('server not registering v48 routes')
api=json.loads((root/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
for path in ['/api/admin/music-speech/v48/review-center','/api/ops/vps/v48/db-validation-report','/api/internal/vps/v48/run-db-validation','/api/admin/music-speech/v48/workbench','/api/internal/speech-training/v48/bulk-review-action','/api/internal/speech-training/v48/review-history-event','/api/ops/search/music/v48/analytics-dashboard','/api/internal/search/music/v48/aggregate-query-logs','/api/internal/search/music/v48/alert-notification','/api/ops/authority-sources/v48/candidate-merge-dashboard','/api/internal/authority-sources/v48/merge-decision','/api/ops/speech-training/v48/model-visualization','/api/internal/speech-training/v48/export-governance-artifact','/api/ops/site/v48/visual-completion','/api/internal/site/v48/visual-audit-record','/api/internal/site/v48/sitemap-ping-record','/api/ops/vps/v48/preflight-contract','/api/ops/next-upgrade-plan/v49']:
    if path not in api.get('paths',{}): raise SystemExit(f'OpenAPI missing {path}')
if len(api.get('paths',{})) < 445: raise SystemExit('OpenAPI path count did not increase enough for v48')
plan=json.loads((root/'data/development/next_upgrade_plan_v49.json').read_text(encoding='utf-8'))
if len(plan.get('items',[])) != 6: raise SystemExit('v49 plan must include 6 items')
print(f"tts/stt music v48 OK: {len(wb.get('items',[]))} workbench rows, {len(analytics.get('daily_metrics',[]))} search days, {len(auth.get('merge_groups',[]))} merge groups, {len(site.get('route_audits',[]))} route audits, {len(api.get('paths',{}))} OpenAPI paths")
