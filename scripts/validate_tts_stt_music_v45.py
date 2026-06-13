#!/usr/bin/env python3
from __future__ import annotations
import json, re
from pathlib import Path
root=Path.cwd()
required=[
 'data/audio/speech_review_workflow_v45.json','data/audio/speech_alignment_import_contract_v45.json','data/audio/tts_stt_experiment_governance_v45.json','data/audio/tts_stt_governance_report_v45.generated.json',
 'data/search/music_query_synonyms_v45.json','data/search/music_search_quality_v45.json','data/search/music_search_quality_report_v45.generated.json',
 'data/integration/authority_source_worker_v45.json','data/integration/authority_source_fetch_dry_run_v45.generated.json','data/site/music_seo_og_contract_v45.json','data/site/music_seo_og_report_v45.generated.json','data/site/sitemap_music_v45.generated.xml','data/ops/vps_preflight_v45.json','data/admin/music_speech_review_center_v45.json','data/development/next_upgrade_plan_v46.json',
 'backend/src/rest/ttsSttMusicV45Routes.ts','frontend-sdk/ttsSttMusicClient.v45.ts','webapp/components/MusicSpeechReviewCenterV45.tsx','webapp/app/music/[id]/opengraph-image.tsx',
 'database/migrations/0041_tts_stt_music_v45.sql','database/seeds/041_tts_stt_music_v45.sql','database/seeds/041_speech_review_workflow_v45.generated.sql','database/seeds/041_music_search_quality_v45.generated.sql','database/seeds/041_authority_source_worker_v45.generated.sql','database/seeds/041_tts_stt_governance_v45.generated.sql','database/seeds/041_site_seo_v45.generated.sql','deploy/vps-tts-stt-v45.sh','docs/tts_stt_music_v45.md','docs/music_search_quality_v45.md','docs/next_upgrade_plan_v46.md'
]
missing=[p for p in required if not (root/p).exists()]
if missing: raise SystemExit('missing required v45 files: '+', '.join(missing))
workflow=json.loads((root/'data/audio/speech_review_workflow_v45.json').read_text(encoding='utf-8'))
if len(workflow.get('items',[])) != 80: raise SystemExit('v45 workflow must cover 80 speech assets')
if workflow.get('security',{}).get('hmac_required') is not True: raise SystemExit('v45 workflow must require HMAC')
if any(i.get('bulk_approve_allowed') for i in workflow.get('items',[])): raise SystemExit('bulk approve must stay disabled')
quality=json.loads((root/'data/search/music_search_quality_v45.json').read_text(encoding='utf-8'))
if len(quality.get('quality_tests',[])) < 5: raise SystemExit('search quality test set too small')
syn=json.loads((root/'data/search/music_query_synonyms_v45.json').read_text(encoding='utf-8'))
if len(syn.get('items',[])) < 10: raise SystemExit('synonym dictionary too small')
report=json.loads((root/'data/search/music_search_quality_report_v45.generated.json').read_text(encoding='utf-8'))
if report.get('passed',0) < 3: raise SystemExit('not enough search quality tests passed')
auth=json.loads((root/'data/integration/authority_source_fetch_dry_run_v45.generated.json').read_text(encoding='utf-8'))
if auth.get('count',0) < 9 or auth.get('public_auto_release') is not False: raise SystemExit('authority dry run must generate >=9 non-public candidates')
gov=json.loads((root/'data/audio/tts_stt_governance_report_v45.generated.json').read_text(encoding='utf-8'))
if gov.get('public_release_allowed') is not False or gov.get('asset_count') != 80: raise SystemExit('governance report must keep public release disabled for 80 assets')
seo=json.loads((root/'data/site/music_seo_og_report_v45.generated.json').read_text(encoding='utf-8'))
if seo.get('url_count',0) < 3 or seo.get('guard',{}).get('no_audio_download') is not True: raise SystemExit('SEO sitemap guard invalid')
migration=(root/'database/migrations/0041_tts_stt_music_v45.sql').read_text(encoding='utf-8')
for table in ['speech_review_decisions_v45','speech_review_audit_log_v45','music_search_synonyms_v45','authority_source_worker_runs_v45','speech_eval_comparisons_v45','main_site_seo_artifacts_v45','vps_preflight_reports_v45']:
    if table not in migration: raise SystemExit(f'migration missing {table}')
route=(root/'backend/src/rest/ttsSttLiveMusicV43Routes.ts').read_text(encoding='utf-8')
for snippet in ['expandMusicQueryV45','facetCountsV45','zeroResultSuggestionsV45','quality_mode: "v45_query_expansion"']:
    if snippet not in route: raise SystemExit(f'v43 music search route missing v45 quality snippet: {snippet}')
server=(root/'backend/src/server.ts').read_text(encoding='utf-8')
if 'registerTtsSttMusicV45Routes' not in server: raise SystemExit('server not registering v45 routes')
api=json.loads((root/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
for path in ['/api/ops/speech-training/v45/review-workflow','/api/internal/speech-training/v45/review-decision','/api/ops/search/music/v45/quality-contract','/api/ops/authority-sources/v45/fetch-worker-contract','/api/ops/speech-training/v45/governance-report','/api/public/music/v45/seo/{id}','/api/ops/site/v45/sitemap-contract','/api/ops/vps/v45/preflight-contract','/api/admin/music-speech/v45/review-center','/api/ops/next-upgrade-plan/v46']:
    if path not in api.get('paths',{}): raise SystemExit(f'OpenAPI missing {path}')
plan=json.loads((root/'data/development/next_upgrade_plan_v46.json').read_text(encoding='utf-8'))
if len(plan.get('items',[])) != 6: raise SystemExit('v46 plan must include 6 items')
print(f"tts/stt music v45 OK: {len(workflow.get('items',[]))} review workflow assets, {len(syn.get('items',[]))} synonym groups, {auth.get('count')} authority candidates, {seo.get('url_count')} sitemap URLs, {len(api.get('paths',{}))} OpenAPI paths")
