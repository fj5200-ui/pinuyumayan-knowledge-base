#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
required=[
 'data/deployment/production_go_live_execution_v52.json','data/security/audit_evidence_chain_opening_v52.json','data/search/music_search_ab_convergence_v52.json','data/integration/authority_metadata_public_release_v52.json','data/audio/speech_model_governance_signoff_v52.json','data/site/brand_performance_monitoring_v52.json','data/admin/music_speech_review_center_v52.json','data/ops/vps_preflight_v52.json','data/development/next_upgrade_plan_v53.json',
 'backend/src/rest/ttsSttMusicV52Routes.ts','frontend-sdk/ttsSttMusicClient.v52.ts','webapp/components/MusicSpeechReviewCenterV52.tsx','webapp/app/admin/music-speech/v52/page.tsx','database/migrations/0048_tts_stt_music_v52.sql','database/seeds/048_tts_stt_music_v52.sql','database/seeds/048_production_go_live_v52.generated.sql','database/seeds/048_audit_evidence_chain_v52.generated.sql','database/seeds/048_search_ab_convergence_v52.generated.sql','database/seeds/048_authority_public_release_v52.generated.sql','database/seeds/048_model_signoff_v52.generated.sql','database/seeds/048_site_monitoring_v52.generated.sql','deploy/vps-tts-stt-v52.sh','docs/tts_stt_music_v52.md','docs/model_governance_signoff_v52.generated.md','docs/next_upgrade_plan_v53.md'
]
missing=[p for p in required if not (root/p).exists()]
if missing: raise SystemExit('missing required v52 files: '+', '.join(missing))
go=json.loads((root/'data/deployment/production_go_live_execution_v52.json').read_text(encoding='utf-8'))
if len(go.get('execution_steps',[])) < 6 or go.get('summary',{}).get('release_allowed_without_real_execution') is not False: raise SystemExit('v52 go-live execution invalid')
evidence=json.loads((root/'data/security/audit_evidence_chain_opening_v52.json').read_text(encoding='utf-8'))
if len(evidence.get('evidence_chain',[])) != 80 or evidence.get('summary',{}).get('approved_training_assets') != 0 or evidence.get('summary',{}).get('public_release_allowed') is not False: raise SystemExit('v52 evidence chain invalid')
search=json.loads((root/'data/search/music_search_ab_convergence_v52.json').read_text(encoding='utf-8'))
if len(search.get('ab_tests',[])) < 3 or search.get('summary',{}).get('auto_rollout_allowed') is not False: raise SystemExit('v52 search convergence invalid')
auth=json.loads((root/'data/integration/authority_metadata_public_release_v52.json').read_text(encoding='utf-8'))
if len(auth.get('publication_cards',[])) < 3 or auth.get('summary',{}).get('public_audio_allowed') is not False or auth.get('summary',{}).get('public_lyrics_allowed') is not False: raise SystemExit('v52 authority release invalid')
model=json.loads((root/'data/audio/speech_model_governance_signoff_v52.json').read_text(encoding='utf-8'))
if model.get('summary',{}).get('blocked_assets') != 80 or model.get('summary',{}).get('public_release_allowed') is not False: raise SystemExit('v52 model signoff invalid')
site=json.loads((root/'data/site/brand_performance_monitoring_v52.json').read_text(encoding='utf-8'))
if site.get('summary',{}).get('minimum_contrast') != 'WCAG AA' or len(site.get('routes',[])) < 7: raise SystemExit('v52 site monitoring invalid')
migration=(root/'database/migrations/0048_tts_stt_music_v52.sql').read_text(encoding='utf-8')
for table in ['production_go_live_steps_v52','production_go_live_rollback_evidence_v52','production_go_live_observations_v52','production_release_seals_v52','audit_evidence_slots_v52','audit_evidence_scans_v52','audit_asset_evidence_seals_v52','audit_training_batches_v52','music_search_ab_convergence_metrics_v52','music_search_variant_decisions_v52','music_search_variant_rollouts_v52','authority_metadata_release_approvals_v52','authority_metadata_index_jobs_v52','authority_metadata_takedowns_v52','speech_model_watermarked_pdfs_v52','speech_model_lineage_graphs_v52','speech_model_release_blockers_v52','site_lighthouse_cwv_runs_v52','site_browser_screenshots_v52','site_og_sitemap_checks_v52']:
    if table not in migration: raise SystemExit(f'v52 migration missing {table}')
route=(root/'backend/src/rest/ttsSttMusicV52Routes.ts').read_text(encoding='utf-8')
for snippet in ['record-go-live-step','record-rollback-evidence','record-observation-sample','seal-release-report','create-upload-slot','record-virus-scan','seal-asset-evidence','create-training-batch','record-convergence-metric','decide-ab-test','rollout-search-variant','rollback-search-variant','approve-metadata-release','index-metadata-card','record-source-drift','takedown-metadata-card','render-watermarked-pdf','record-lineage-graph','record-version-diff','close-model-blocker','record-lighthouse-cwv','record-browser-screenshot','record-og-check','record-sitemap-ping','beginTransaction','rollback()','commit()']:
    if snippet not in route: raise SystemExit(f'v52 route missing {snippet}')
server=(root/'backend/src/server.ts').read_text(encoding='utf-8')
if 'registerTtsSttMusicV52Routes' not in server: raise SystemExit('server not registering v52 routes')
api=json.loads((root/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
for path in ['/api/admin/music-speech/v52/review-center','/api/ops/vps/v52/go-live-execution','/api/internal/vps/v52/record-go-live-step','/api/internal/vps/v52/record-rollback-evidence','/api/internal/vps/v52/record-observation-sample','/api/internal/vps/v52/seal-release-report','/api/admin/speech-training/v52/evidence-chain','/api/internal/speech-training/v52/create-upload-slot','/api/internal/speech-training/v52/record-virus-scan','/api/internal/speech-training/v52/seal-asset-evidence','/api/internal/speech-training/v52/create-training-batch','/api/ops/search/music/v52/ab-convergence','/api/internal/search/music/v52/record-convergence-metric','/api/internal/search/music/v52/decide-ab-test','/api/internal/search/music/v52/rollout-search-variant','/api/internal/search/music/v52/rollback-search-variant','/api/ops/authority-sources/v52/public-release','/api/internal/authority-sources/v52/approve-metadata-release','/api/internal/authority-sources/v52/index-metadata-card','/api/internal/authority-sources/v52/record-source-drift','/api/internal/authority-sources/v52/takedown-metadata-card','/api/ops/speech-training/v52/model-signoff','/api/internal/speech-training/v52/render-watermarked-pdf','/api/internal/speech-training/v52/record-lineage-graph','/api/internal/speech-training/v52/record-version-diff','/api/internal/speech-training/v52/close-model-blocker','/api/ops/site/v52/performance-monitoring','/api/internal/site/v52/record-lighthouse-cwv','/api/internal/site/v52/record-browser-screenshot','/api/internal/site/v52/record-og-check','/api/internal/site/v52/record-sitemap-ping','/api/ops/vps/v52/preflight-contract','/api/ops/next-upgrade-plan/v53']:
    if path not in api.get('paths',{}): raise SystemExit(f'OpenAPI missing {path}')
if len(api.get('paths',{})) < 555: raise SystemExit('OpenAPI path count did not increase enough for v52')
plan=json.loads((root/'data/development/next_upgrade_plan_v53.json').read_text(encoding='utf-8'))
if len(plan.get('items',[])) != 6: raise SystemExit('v53 plan must include 6 items')
print(f"tts/stt music v52 OK: {len(evidence.get('evidence_chain',[]))} evidence slots, {len(go.get('execution_steps',[]))} go-live steps, {len(search.get('ab_tests',[]))} A/B tests, {len(auth.get('publication_cards',[]))} metadata cards, {len(site.get('routes',[]))} site routes, {len(api.get('paths',{}))} OpenAPI paths")
