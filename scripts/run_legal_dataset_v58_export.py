#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
dataset=json.loads((root/'data/security/legal_speech_dataset_v58_0.json').read_text(encoding='utf-8'))
(root/'data/runtime').mkdir(exist_ok=True)
(root/'data/runtime/v58_dataset_export.last.json').write_text(json.dumps({'version':'v58','dataset_version':dataset['dataset_version'],'export_allowed':False,'blocked_rows':dataset['summary']['blocked_rows']},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f"v58 legal dataset export gate: train={dataset['summary']['train_rows']} dev={dataset['summary']['dev_rows']} test={dataset['summary']['test_rows']} blocked={dataset['summary']['blocked_rows']}")
