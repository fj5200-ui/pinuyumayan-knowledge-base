#!/usr/bin/env python3
from __future__ import annotations
import json, re
from pathlib import Path
root=Path.cwd()
required=[
 'data/audio/speech_reviewer_queue_v46.json','data/database/vps_tts_stt_transaction_contract_v46.json','data/search/music_search_observability_v46.json','data/search/music_search_observability_report_v46.generated.json','data/integration/authority_source_governance_v46.json','data/integration/authority_source_retry_merge_report_v46.generated.json','data/audio/speech_model_experiment_registry_v46.json','data/audio/speech_model_experiment_report_v46.generated.json','data/site/music_site_experience_v46.json','data/site/music_site_experience_report_v46.generated.json','data/admin/music_speech_review_center_v46.json','data/ops/vps_preflight_v46.json','data/development/next_upgrade_plan_v47.json',
 'backend/src/rest/ttsSttMusicV46Routes.ts','frontend-sdk/ttsSttMusicClient.v46.ts','webapp/components/MusicSpeechReviewCenterV46.tsx','database/migrations/0042_tts_stt_music_v46.sql','database/seeds/042_tts_stt_music_v46.sql','database/seeds/042_speech_reviewer_queue_v46.generated.sql','database/seeds/042_music_search_observability_v46.generated.sql','database/seeds/042_authority_source_governance_v46.generated.sql','database/seeds/042_speech_model_experiment_registry_v46.generated.sql','database/seeds/042_site_experience_v46.generated.sql','deploy/vps-tts-stt-v46.sh','docs/tts_stt_music_v46.md','docs/search_observability_v46.md','docs/next_upgrade_plan_v47.md'
]
missing=[p for p in required if not (root/p).exists()]
if missing: raise SystemExit('missing required v46 files: '+', '.join(missing))
queue=json.loads((root/'data/audio/speech_reviewer_queue_v46.json').read_text(encoding='utf-8'))
if len(queue.get('items',[])) != 80: raise SystemExit('v46 reviewer queue must cover 80 assets')
if queue.get('summary',{}).get('bulk_approve_allowed') is not False: raise SystemExit('v46 bulk approve must stay disabled')
if 'speech_lead_reviewer' not in queue.get('roles',{}): raise SystemExit('v46 role permissions missing speech_lead_reviewer')
contract=json.loads((root/'data/database/vps_tts_stt_transaction_contract_v46.json').read_text(encoding='utf-8'))
if not contract.get('requires_database_url') or contract.get('transaction_semantics',{}).get('failure')!='ROLLBACK': raise SystemExit('v46 transaction contract invalid')
obs=json.loads((root/'data/search/music_search_observability_v46.json').read_text(encoding='utf-8'))
if len(obs.get('sample_events',[])) < 5 or 'p95_latency_ms' not in obs.get('metrics',{}): raise SystemExit('v46 search observability invalid')
obsr=json.loads((root/'data/search/music_search_observability_report_v46.generated.json').read_text(encoding='utf-8'))
if obsr.get('passed',0) < 4 or not obsr.get('zero_result_examples'): raise SystemExit('v46 search observability report invalid')
auth=json.loads((root/'data/integration/authority_source_governance_v46.json').read_text(encoding='utf-8'))
if len(auth.get('fetch_policies',[])) < 3 or auth.get('public_auto_release') is not False: raise SystemExit('v46 authority governance invalid')
if not all(p.get('etag_enabled') and p.get('if_modified_since_enabled') for p in auth.get('fetch_policies',[])): raise SystemExit('v46 authority policies must use ETag and If-Modified-Since')
reg=json.loads((root/'data/audio/speech_model_experiment_registry_v46.json').read_text(encoding='utf-8'))
if reg.get('summary',{}).get('public_release_allowed') is not False or reg.get('summary',{}).get('blocked_dataset_assets') != 80: raise SystemExit('v46 model registry must keep release blocked for 80 assets')
site=json.loads((root/'data/site/music_site_experience_v46.json').read_text(encoding='utf-8'))
if len(site.get('recommended_queries',[])) < 6 or not site.get('day_mode_contrast',{}).get('avoid_yellow_text_on_white'): raise SystemExit('v46 site experience contrast/recommendations invalid')
migration=(root/'database/migrations/0042_tts_stt_music_v46.sql').read_text(encoding='utf-8')
for table in ['speech_reviewer_queue_v46','speech_review_transactions_v46','speech_alignment_transactions_v46','music_search_query_logs_v46','music_search_zero_result_events_v46','authority_source_fetch_policies_v46','authority_source_retry_queue_v46','authority_source_candidate_merge_requests_v46','speech_model_experiment_registry_v46','speech_dataset_lineage_v46','main_site_experience_artifacts_v46','vps_preflight_reports_v46']:
    if table not in migration: raise SystemExit(f'migration missing {table}')
route=(root/'backend/src/rest/ttsSttMusicV46Routes.ts').read_text(encoding='utf-8')
for snippet in ['beginTransaction','commit()','rollback()','transactional-review-decision','query-log','retry-or-merge','model-experiment-decision']:
    if snippet not in route: raise SystemExit(f'v46 route missing snippet {snippet}')
server=(root/'backend/src/server.ts').read_text(encoding='utf-8')
if 'registerTtsSttMusicV46Routes' not in server: raise SystemExit('server not registering v46 routes')
search_route=(root/'backend/src/rest/ttsSttLiveMusicV43Routes.ts').read_text(encoding='utf-8')
for snippet in ['observability_mode: "v46_query_log_ready"','observation_endpoint: "/api/internal/search/music/v46/query-log"']:
    if snippet not in search_route: raise SystemExit(f'v43 search route missing v46 observability snippet: {snippet}')
api=json.loads((root/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
for path in ['/api/ops/speech-training/v46/reviewer-queue','/api/internal/speech-training/v46/assign-reviewer','/api/internal/speech-training/v46/transactional-review-decision','/api/internal/speech-training/v46/transactional-alignment-import','/api/ops/search/music/v46/observability-dashboard','/api/internal/search/music/v46/query-log','/api/ops/authority-sources/v46/fetch-governance','/api/internal/authority-sources/v46/retry-or-merge','/api/ops/speech-training/v46/experiment-registry','/api/internal/speech-training/v46/model-experiment-decision','/api/ops/site/v46/experience-contract','/api/admin/music-speech/v46/review-center','/api/ops/vps/v46/preflight-contract','/api/ops/next-upgrade-plan/v47']:
    if path not in api.get('paths',{}): raise SystemExit(f'OpenAPI missing {path}')
plan=json.loads((root/'data/development/next_upgrade_plan_v47.json').read_text(encoding='utf-8'))
if len(plan.get('items',[])) != 6: raise SystemExit('v47 plan must include 6 items')
print(f"tts/stt music v46 OK: {len(queue.get('items',[]))} queue assets, {len(obs.get('sample_events',[]))} search samples, {len(auth.get('fetch_policies',[]))} source policies, {len(reg.get('items',[]))} experiments, {len(api.get('paths',{}))} OpenAPI paths")
