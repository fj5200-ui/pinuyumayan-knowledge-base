#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
required=[
 'data/deployment/production_cutover_v50.json','data/security/audit_evidence_store_v50.json','data/search/music_search_intelligence_v50.json','data/integration/authority_metadata_publication_v50.json','data/audio/speech_model_governance_delivery_v50.json','data/site/frontstage_brand_completion_v50.json','data/admin/music_speech_review_center_v50.json','data/ops/vps_preflight_v50.json','data/development/next_upgrade_plan_v51.json',
 'backend/src/rest/ttsSttMusicV50Routes.ts','frontend-sdk/ttsSttMusicClient.v50.ts','webapp/components/MusicSpeechReviewCenterV50.tsx','webapp/app/admin/music-speech/v50/page.tsx','database/migrations/0046_tts_stt_music_v50.sql','database/seeds/046_tts_stt_music_v50.sql','database/seeds/046_production_cutover_v50.generated.sql','database/seeds/046_audit_evidence_store_v50.generated.sql','database/seeds/046_search_intelligence_v50.generated.sql','database/seeds/046_authority_publication_v50.generated.sql','database/seeds/046_model_governance_delivery_v50.generated.sql','database/seeds/046_site_brand_completion_v50.generated.sql','deploy/vps-tts-stt-v50.sh','docs/tts_stt_music_v50.md','docs/model_governance_delivery_v50.generated.md','docs/next_upgrade_plan_v51.md'
]
missing=[p for p in required if not (root/p).exists()]
if missing: raise SystemExit('missing required v50 files: '+', '.join(missing))
cutover=json.loads((root/'data/deployment/production_cutover_v50.json').read_text(encoding='utf-8'))
if len(cutover.get('cutover_steps',[])) < 6 or cutover.get('summary',{}).get('release_allowed_without_vps_run') is not False: raise SystemExit('v50 cutover invalid')
evidence=json.loads((root/'data/security/audit_evidence_store_v50.json').read_text(encoding='utf-8'))
if len(evidence.get('items',[])) != 80 or evidence.get('summary',{}).get('public_release_allowed') is not False: raise SystemExit('v50 evidence store invalid')
if evidence.get('summary',{}).get('bulk_signoff_allowed') is not False: raise SystemExit('v50 bulk signoff must be blocked')
search=json.loads((root/'data/search/music_search_intelligence_v50.json').read_text(encoding='utf-8'))
if len(search.get('synonym_review_tasks',[])) < 3 or len(search.get('intent_classification',[])) < 5 or search.get('summary',{}).get('auto_apply_allowed') is not False: raise SystemExit('v50 search intelligence invalid')
auth=json.loads((root/'data/integration/authority_metadata_publication_v50.json').read_text(encoding='utf-8'))
if len(auth.get('publication_queue',[])) < 3 or auth.get('summary',{}).get('public_audio_allowed') is not False or auth.get('summary',{}).get('public_lyrics_allowed') is not False: raise SystemExit('v50 authority publication invalid')
model=json.loads((root/'data/audio/speech_model_governance_delivery_v50.json').read_text(encoding='utf-8'))
if model.get('summary',{}).get('blocked_assets') != 80 or model.get('summary',{}).get('public_release_allowed') is not False: raise SystemExit('v50 model governance must remain blocked')
site=json.loads((root/'data/site/frontstage_brand_completion_v50.json').read_text(encoding='utf-8'))
if site.get('summary',{}).get('minimum_contrast') != 'WCAG AA' or len(site.get('route_brand_validations',[])) < 7: raise SystemExit('v50 brand completion invalid')
migration=(root/'database/migrations/0046_tts_stt_music_v50.sql').read_text(encoding='utf-8')
for table in ['production_cutover_runs_v50','production_cutover_health_checks_v50','production_cutover_dns_events_v50','production_rollback_rehearsals_v50','audit_evidence_store_v50','audit_evidence_signoffs_v50','audit_evidence_export_jobs_v50','music_search_synonym_review_tasks_v50','music_search_ltr_weights_v50','music_search_ab_tests_v50','music_search_intent_classifications_v50','authority_metadata_publication_queue_v50','authority_metadata_citation_formats_v50','authority_metadata_takedown_requests_v50','authority_source_change_notifications_v50','speech_model_governance_delivery_exports_v50','speech_model_version_diffs_v50','speech_model_release_blocker_closures_v50','site_brand_completion_routes_v50','site_browser_screenshot_validations_v50','site_seo_og_monitors_v50','site_core_web_vitals_runs_v50']:
    if table not in migration: raise SystemExit(f'v50 migration missing {table}')
route=(root/'backend/src/rest/ttsSttMusicV50Routes.ts').read_text(encoding='utf-8')
for snippet in ['record-cutover-run','record-health-check','record-dns-cutover','record-rollback-rehearsal','record-evidence','signoff-evidence','export-evidence','review-synonym-task','record-ab-test','record-intent-classification','publish-metadata-only','record-source-notification','takedown-request','render-governance-pdf','record-version-diff','close-release-blocker','record-browser-screenshot','record-cwv-run','record-seo-og-monitor','beginTransaction','rollback()','commit()']:
    if snippet not in route: raise SystemExit(f'v50 route missing {snippet}')
server=(root/'backend/src/server.ts').read_text(encoding='utf-8')
if 'registerTtsSttMusicV50Routes' not in server: raise SystemExit('server not registering v50 routes')
api=json.loads((root/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
for path in ['/api/admin/music-speech/v50/review-center','/api/ops/vps/v50/cutover-plan','/api/internal/vps/v50/record-cutover-run','/api/internal/vps/v50/record-health-check','/api/internal/vps/v50/record-dns-cutover','/api/internal/vps/v50/record-rollback-rehearsal','/api/admin/speech-training/v50/evidence-store','/api/internal/speech-training/v50/record-evidence','/api/internal/speech-training/v50/signoff-evidence','/api/internal/speech-training/v50/export-evidence','/api/ops/search/music/v50/intelligence','/api/internal/search/music/v50/review-synonym-task','/api/internal/search/music/v50/record-ab-test','/api/internal/search/music/v50/record-intent-classification','/api/ops/authority-sources/v50/metadata-publication','/api/internal/authority-sources/v50/publish-metadata-only','/api/internal/authority-sources/v50/record-source-notification','/api/internal/authority-sources/v50/takedown-request','/api/ops/speech-training/v50/governance-delivery','/api/internal/speech-training/v50/render-governance-pdf','/api/internal/speech-training/v50/record-version-diff','/api/internal/speech-training/v50/close-release-blocker','/api/ops/site/v50/brand-completion','/api/internal/site/v50/record-browser-screenshot','/api/internal/site/v50/record-cwv-run','/api/internal/site/v50/record-seo-og-monitor','/api/ops/vps/v50/preflight-contract','/api/ops/next-upgrade-plan/v51']:
    if path not in api.get('paths',{}): raise SystemExit(f'OpenAPI missing {path}')
if len(api.get('paths',{})) < 495: raise SystemExit('OpenAPI path count did not increase enough for v50')
plan=json.loads((root/'data/development/next_upgrade_plan_v51.json').read_text(encoding='utf-8'))
if len(plan.get('items',[])) != 6: raise SystemExit('v51 plan must include 6 items')
print(f"tts/stt music v50 OK: {len(evidence.get('items',[]))} evidence rows, {len(cutover.get('cutover_steps',[]))} cutover steps, {len(search.get('synonym_review_tasks',[]))} synonym tasks, {len(auth.get('publication_queue',[]))} publication candidates, {len(site.get('route_brand_validations',[]))} site routes, {len(api.get('paths',{}))} OpenAPI paths")
