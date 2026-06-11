#!/usr/bin/env python3
from __future__ import annotations
import json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
required=[
 'data/audio/puyuma_pronunciation_catalog_v16.json',
 'data/audio/puyuma_tts_voice_model_registry_v16.json',
 'data/audio/tts_pronunciation_quality_gate_v16.json',
 'database/migrations/0014_pronunciation_tts_runtime_v16.sql',
 'database/seeds/014_pronunciation_assets_v16.sql',
 'backend/src/modules/pronunciation/service.ts',
 'backend/src/rest/pronunciationRoutes.ts',
 'frontend-sdk/puyumaPronunciationClient.v16.ts',
 'docs/pronunciation_tts_runtime_v16.md',
 'data/deployment/v16_pronunciation_tts_manifest.json',
]
missing=[p for p in required if not (ROOT/p).exists()]
if missing:
    raise SystemExit('missing v16 pronunciation files: '+', '.join(missing))
cat=json.loads((ROOT/'data/audio/puyuma_pronunciation_catalog_v16.json').read_text(encoding='utf-8'))
entries=cat.get('entries',[])
if len(entries)<80:
    raise SystemExit(f'expected at least 80 pronunciation assets, got {len(entries)}')
for idx,e in enumerate(entries):
    if not e.get('pronunciation',{}).get('source_audio_url'):
        raise SystemExit(f'missing source audio url at {idx}')
    if e.get('quality',{}).get('is_synthetic') is not False:
        raise SystemExit(f'public pronunciation asset must not be synthetic at {idx}')
models=json.loads((ROOT/'data/audio/puyuma_tts_voice_model_registry_v16.json').read_text(encoding='utf-8')).get('models',[])
if not any(m.get('id')=='puyuma_source_audio_passthrough_v1' and m.get('public_ui_enabled') for m in models):
    raise SystemExit('missing source audio passthrough model')
if any(m.get('model_type')=='neural_tts_training_candidate' and m.get('public_ui_enabled') for m in models):
    raise SystemExit('neural TTS candidate must not be public-enabled by default')
openapi=json.loads((ROOT/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
for p in ['/api/public/pronunciation/{entryId}','/api/public/tts/pronounce','/api/admin/tts/models','/api/internal/tts/synthesize']:
    if p not in openapi.get('paths',{}):
        raise SystemExit('openapi missing '+p)
print(f'pronunciation-first TTS v16 OK: {len(entries)} verified source-audio pronunciation assets, neural public TTS disabled')
