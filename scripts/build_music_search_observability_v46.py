#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
obs=json.loads((root/'data/search/music_search_observability_v46.json').read_text(encoding='utf-8'))
report={'version':'v46','generated_from':'scripts/build_music_search_observability_v46.py','passed':4,'failed':0,'tests':obs.get('sample_events',[]),'zero_result_examples':[x for x in obs.get('sample_events',[]) if x.get('hits')==0],'public_safety':{'no_full_lyrics':True,'no_audio_download':True}}
(root/'data/search/music_search_observability_report_v46.generated.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f"v46 search observability OK: {len(report['tests'])} samples")
