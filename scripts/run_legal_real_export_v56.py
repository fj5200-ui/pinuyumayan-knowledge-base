#!/usr/bin/env python3
from __future__ import annotations
import json, os
from pathlib import Path
root=Path.cwd()
legal=json.loads((root/'data/security/legal_speech_real_export_v56.json').read_text(encoding='utf-8'))
print(f"v56 legal real export gate: {legal['summary']['train_rows']}/{legal['summary']['dev_rows']}/{legal['summary']['test_rows']} train/dev/test rows; blocked={legal['summary']['blocked_rows']}")
(root/'data/runtime').mkdir(exist_ok=True)
(root/'data/runtime/v56_legal_real_export.last.json').write_text(json.dumps({'version':'v56','export_allowed':False,'blocked_rows':legal['summary']['blocked_rows']},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
