#!/usr/bin/env python3
from __future__ import annotations
import json, re
from pathlib import Path
root=Path.cwd()
required=[
 'data/audio/speech_review_action_ui_v47.json','data/database/mysql_transaction_integration_tests_v47.json','data/search/music_search_production_observability_v47.json','data/integration/authority_source_fetch_adapters_v47.json','data/audio/speech_model_governance_reports_v47.json','data/site/music_site_polish_v47.json','data/admin/music_speech_review_center_v47.json','data/ops/vps_preflight_v47.json','data/development/next_upgrade_plan_v48.json',
 'backend/src/rest/ttsSttMusicV47Routes.ts','frontend-sdk/ttsSttMusicClient.v47.ts','webapp/components/MusicSpeechReviewCenterV47.tsx','database/migrations/0043_tts_stt_music_v47.sql','database/seeds/043_tts_stt_music_v47.sql','database/seeds/043_review_action_ui_v47.generated.sql','database/seeds/043_mysql_transaction_tests_v47.generated.sql','database/seeds/043_search_observability_v47.generated.sql','database/seeds/043_authority_adapters_v47.generated.sql','database/seeds/043_model_governance_v47.generated.sql','database/seeds/043_site_polish_v47.generated.sql','deploy/vps-tts-stt-v47.sh','docs/tts_stt_music_v47.md','docs/next_upgrade_plan_v48.md'
]
missing=[p for p in required if not (root/p).exists()]
if missing: raise SystemExit('missing required v47 files: '+', '.join(missing))
ui=json.loads((root/'data/audio/speech_review_action_ui_v47.json').read_text(encoding='utf-8'))
if len(ui.get('items',[])) != 80: raise SystemExit('v47 action UI must cover 80 queue rows')
if ui.get('summary',{}).get('bulk_approve_allowed') is not False or ui.get('summary',{}).get('public_release_allowed') is not False: raise SystemExit('v47 action UI safety defaults invalid')
if 'hmac_nonce_bridge' not in ui or not ui['hmac_nonce_bridge'].get('server_hmac_middleware_required'): raise SystemExit('v47 HMAC nonce bridge missing')
for key in ['assign_reviewer','upload_evidence','return_for_fix','reject_gate','approve_gate','import_alignment']:
    if key not in ui.get('form_schemas',{}): raise SystemExit(f'v47 form schema missing {key}')
tests=json.loads((root/'data/database/mysql_transaction_integration_tests_v47.json').read_text(encoding='utf-8'))
if len(tests.get('test_cases',[])) < 6 or tests.get('semantics',{}).get('failure')!='ROLLBACK': raise SystemExit('v47 transaction tests invalid')
search=json.loads((root/'data/search/music_search_production_observability_v47.json').read_text(encoding='utf-8'))
if not search.get('v43_search_route_writes_query_log') or len(search.get('alert_rules',[])) < 2: raise SystemExit('v47 search observability not wired')
auth=json.loads((root/'data/integration/authority_source_fetch_adapters_v47.json').read_text(encoding='utf-8'))
if auth.get('live_fetch_default_enabled') is not False or len(auth.get('adapters',[])) < 3: raise SystemExit('v47 authority adapters invalid')
if not all(a.get('fetch_mode')=='metadata_only_candidate_snapshot' and a.get('candidate_auto_public') is False for a in auth.get('adapters',[])): raise SystemExit('v47 authority adapters must be metadata-only and not auto-public')
gov=json.loads((root/'data/audio/speech_model_governance_reports_v47.json').read_text(encoding='utf-8'))
if gov.get('summary',{}).get('blocked_assets') != 80 or gov.get('summary',{}).get('public_release_allowed') is not False: raise SystemExit('v47 model governance must remain blocked')
site=json.loads((root/'data/site/music_site_polish_v47.json').read_text(encoding='utf-8'))
if site.get('day_mode_tokens',{}).get('minimum_contrast') != 'WCAG AA' or 'no lyrics/audio downloads' not in ' '.join(site.get('visual_upgrades',[])): raise SystemExit('v47 site polish contrast/guard invalid')
migration=(root/'database/migrations/0043_tts_stt_music_v47.sql').read_text(encoding='utf-8')
for table in ['speech_review_action_forms_v47','speech_review_hmac_nonces_v47','speech_review_action_audit_v47','mysql_transaction_integration_test_runs_v47','music_search_query_logs_v47','music_search_weekly_zero_result_reports_v47','music_search_alert_rules_v47','authority_source_fetch_runs_v47','authority_source_candidate_snapshots_v47','speech_model_governance_reports_v47','main_site_polish_validations_v47','vps_preflight_reports_v47']:
    if table not in migration: raise SystemExit(f'v47 migration missing {table}')
route=(root/'backend/src/rest/ttsSttMusicV47Routes.ts').read_text(encoding='utf-8')
for snippet in ['hmac-nonce','upload-evidence-record','review-action','run-transaction-test','query-log','live-fetch-run','candidate-review','model-governance-decision','beginTransaction','rollback()','commit()']:
    if snippet not in route: raise SystemExit(f'v47 route missing {snippet}')
server=(root/'backend/src/server.ts').read_text(encoding='utf-8')
if 'registerTtsSttMusicV47Routes' not in server: raise SystemExit('server not registering v47 routes')
search_route=(root/'backend/src/rest/ttsSttLiveMusicV43Routes.ts').read_text(encoding='utf-8')
for snippet in ['writeMusicSearchQueryLogV47','observability_mode: "v47_query_log_wired"','/api/internal/search/music/v47/query-log','music_search_query_logs_v47']:
    if snippet not in search_route: raise SystemExit(f'v43 search route missing v47 query log wiring: {snippet}')
api=json.loads((root/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
for path in ['/api/admin/music-speech/v47/review-center','/api/ops/speech-training/v47/review-action-ui','/api/internal/speech-training/v47/hmac-nonce','/api/internal/speech-training/v47/upload-evidence-record','/api/internal/speech-training/v47/review-action','/api/ops/database/v47/transaction-tests','/api/internal/database/v47/run-transaction-test','/api/ops/search/music/v47/observability-dashboard','/api/internal/search/music/v47/query-log','/api/ops/authority-sources/v47/fetch-adapters','/api/internal/authority-sources/v47/live-fetch-run','/api/internal/authority-sources/v47/candidate-review','/api/ops/speech-training/v47/governance-report','/api/internal/speech-training/v47/model-governance-decision','/api/ops/site/v47/polish-contract','/api/ops/vps/v47/preflight-contract','/api/ops/next-upgrade-plan/v48']:
    if path not in api.get('paths',{}): raise SystemExit(f'OpenAPI missing {path}')
if len(api.get('paths',{})) < 425: raise SystemExit('OpenAPI path count did not increase enough for v47')
plan=json.loads((root/'data/development/next_upgrade_plan_v48.json').read_text(encoding='utf-8'))
if len(plan.get('items',[])) != 6: raise SystemExit('v48 plan must include 6 items')
print(f"tts/stt music v47 OK: {len(ui.get('items',[]))} actionable rows, {len(tests.get('test_cases',[]))} transaction tests, {len(search.get('sample_logs',[]))} query samples, {len(auth.get('adapters',[]))} adapters, {len(api.get('paths',{}))} OpenAPI paths")
