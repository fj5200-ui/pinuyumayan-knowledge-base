#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
required=[
 'data/deployment/production_cutover_seal_v51.json','data/security/audit_evidence_upload_v51.json','data/search/music_search_ab_experiment_v51.json','data/integration/authority_metadata_live_publish_v51.json','data/audio/speech_model_governance_renderer_v51.json','data/site/brand_performance_validation_v51.json','data/admin/music_speech_review_center_v51.json','data/ops/vps_preflight_v51.json','data/development/next_upgrade_plan_v52.json',
 'backend/src/rest/ttsSttMusicV51Routes.ts','frontend-sdk/ttsSttMusicClient.v51.ts','webapp/components/MusicSpeechReviewCenterV51.tsx','webapp/app/admin/music-speech/v51/page.tsx','database/migrations/0047_tts_stt_music_v51.sql','database/seeds/047_tts_stt_music_v51.sql','database/seeds/047_production_cutover_seal_v51.generated.sql','database/seeds/047_audit_evidence_upload_v51.generated.sql','database/seeds/047_search_ab_experiment_v51.generated.sql','database/seeds/047_authority_live_publish_v51.generated.sql','database/seeds/047_model_renderer_v51.generated.sql','database/seeds/047_site_performance_v51.generated.sql','deploy/vps-tts-stt-v51.sh','docs/tts_stt_music_v51.md','docs/model_governance_renderer_v51.generated.md','docs/next_upgrade_plan_v52.md'
]
missing=[p for p in required if not (root/p).exists()]
if missing: raise SystemExit('missing required v51 files: '+', '.join(missing))
cutover=json.loads((root/'data/deployment/production_cutover_seal_v51.json').read_text(encoding='utf-8'))
if len(cutover.get('seal_checklist',[])) < 6 or cutover.get('summary',{}).get('sealed_release_allowed_without_real_vps_run') is not False: raise SystemExit('v51 cutover seal invalid')
evidence=json.loads((root/'data/security/audit_evidence_upload_v51.json').read_text(encoding='utf-8'))
if len(evidence.get('uploads',[])) != 80 or evidence.get('summary',{}).get('public_release_allowed') is not False: raise SystemExit('v51 evidence upload invalid')
if evidence.get('summary',{}).get('bulk_signoff_allowed') is not False: raise SystemExit('v51 bulk signoff must be blocked')
search=json.loads((root/'data/search/music_search_ab_experiment_v51.json').read_text(encoding='utf-8'))
if len(search.get('ab_tests',[])) < 3 or search.get('summary',{}).get('traffic_percent_default') != 10 or search.get('summary',{}).get('auto_apply_allowed') is not False: raise SystemExit('v51 search A/B invalid')
auth=json.loads((root/'data/integration/authority_metadata_live_publish_v51.json').read_text(encoding='utf-8'))
if len(auth.get('publication_cards',[])) < 3 or auth.get('summary',{}).get('public_audio_allowed') is not False or auth.get('summary',{}).get('public_lyrics_allowed') is not False: raise SystemExit('v51 authority live publication invalid')
model=json.loads((root/'data/audio/speech_model_governance_renderer_v51.json').read_text(encoding='utf-8'))
if model.get('summary',{}).get('blocked_assets') != 80 or model.get('summary',{}).get('public_release_allowed') is not False: raise SystemExit('v51 model renderer must remain blocked')
site=json.loads((root/'data/site/brand_performance_validation_v51.json').read_text(encoding='utf-8'))
if site.get('summary',{}).get('minimum_contrast') != 'WCAG AA' or len(site.get('routes',[])) < 7: raise SystemExit('v51 site brand performance invalid')
migration=(root/'database/migrations/0047_tts_stt_music_v51.sql').read_text(encoding='utf-8')
for table in ['production_cutover_seal_reports_v51','production_cutover_restore_drills_v51','production_cutover_observations_v51','audit_evidence_uploads_v51','audit_evidence_attachment_scans_v51','audit_evidence_chain_seals_v51','music_search_ab_exposures_v51','music_search_ab_metrics_v51','music_search_synonym_merges_v51','authority_metadata_live_publications_v51','authority_metadata_source_notices_v51','authority_metadata_card_hides_v51','speech_model_governance_pdf_renders_v51','speech_model_governance_signoff_stamps_v51','speech_model_version_comparisons_v51','site_lighthouse_runs_v51','site_contrast_fixes_v51','site_og_sitemap_pings_v51']:
    if table not in migration: raise SystemExit(f'v51 migration missing {table}')
route=(root/'backend/src/rest/ttsSttMusicV51Routes.ts').read_text(encoding='utf-8')
for snippet in ['record-cutover-seal','record-restore-drill','record-cutover-observation','upload-evidence-attachment','record-attachment-scan','seal-evidence-chain','record-ab-exposure','record-ab-metric','merge-synonym-task','publish-metadata-card','record-source-change-notice','hide-metadata-card','render-governance-pdf','record-signoff-stamp','record-model-version-comparison','record-lighthouse-run','record-contrast-fix','record-og-sitemap-ping','beginTransaction','rollback()','commit()']:
    if snippet not in route: raise SystemExit(f'v51 route missing {snippet}')
server=(root/'backend/src/server.ts').read_text(encoding='utf-8')
if 'registerTtsSttMusicV51Routes' not in server: raise SystemExit('server not registering v51 routes')
api=json.loads((root/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
for path in ['/api/admin/music-speech/v51/review-center','/api/ops/vps/v51/cutover-seal','/api/internal/vps/v51/record-cutover-seal','/api/internal/vps/v51/record-restore-drill','/api/internal/vps/v51/record-cutover-observation','/api/admin/speech-training/v51/evidence-upload','/api/internal/speech-training/v51/upload-evidence-attachment','/api/internal/speech-training/v51/record-attachment-scan','/api/internal/speech-training/v51/seal-evidence-chain','/api/ops/search/music/v51/ab-experiment','/api/internal/search/music/v51/record-ab-exposure','/api/internal/search/music/v51/record-ab-metric','/api/internal/search/music/v51/merge-synonym-task','/api/ops/authority-sources/v51/live-publication','/api/internal/authority-sources/v51/publish-metadata-card','/api/internal/authority-sources/v51/record-source-change-notice','/api/internal/authority-sources/v51/hide-metadata-card','/api/ops/speech-training/v51/governance-renderer','/api/internal/speech-training/v51/render-governance-pdf','/api/internal/speech-training/v51/record-signoff-stamp','/api/internal/speech-training/v51/record-model-version-comparison','/api/ops/site/v51/brand-performance','/api/internal/site/v51/record-lighthouse-run','/api/internal/site/v51/record-contrast-fix','/api/internal/site/v51/record-og-sitemap-ping','/api/ops/vps/v51/preflight-contract','/api/ops/next-upgrade-plan/v52']:
    if path not in api.get('paths',{}): raise SystemExit(f'OpenAPI missing {path}')
if len(api.get('paths',{})) < 522: raise SystemExit('OpenAPI path count did not increase enough for v51')
plan=json.loads((root/'data/development/next_upgrade_plan_v52.json').read_text(encoding='utf-8'))
if len(plan.get('items',[])) != 6: raise SystemExit('v52 plan must include 6 items')
print(f"tts/stt music v51 OK: {len(evidence.get('uploads',[]))} evidence uploads, {len(cutover.get('seal_checklist',[]))} cutover seal checks, {len(search.get('ab_tests',[]))} A/B tests, {len(auth.get('publication_cards',[]))} metadata cards, {len(site.get('routes',[]))} site routes, {len(api.get('paths',{}))} OpenAPI paths")
