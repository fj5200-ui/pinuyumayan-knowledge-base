#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
reg=json.loads((root/'data/audio/speech_model_experiment_registry_v46.json').read_text(encoding='utf-8'))
report={'version':'v46','generated_from':'scripts/build_speech_model_registry_v46.py','experiment_count':len(reg.get('items',[])),'public_release_allowed':False,'release_blockers':['authorized_dataset_empty','speaker_consent_missing','alignment_missing'],'asset_count':80}
(root/'data/audio/speech_model_experiment_report_v46.generated.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f"v46 model registry OK: {report['experiment_count']} experiments")
