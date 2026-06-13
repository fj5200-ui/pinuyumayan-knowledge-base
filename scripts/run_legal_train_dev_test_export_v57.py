#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
legal=json.loads((root/'data/security/legal_speech_train_dev_test_v57.json').read_text(encoding='utf-8'))
print(f"v57 legal train/dev/test export gate: train={legal['summary']['train_rows']} dev={legal['summary']['dev_rows']} test={legal['summary']['test_rows']} blocked={legal['summary']['blocked_rows']}")
(root/'data/runtime').mkdir(exist_ok=True)
(root/'data/runtime/v57_legal_train_dev_test_export.last.json').write_text(json.dumps({'version':'v57','export_allowed':False,'blocked_rows':legal['summary']['blocked_rows']},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
