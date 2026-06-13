#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
(root/'data/runtime').mkdir(exist_ok=True)
obj=json.loads("{\"version\": \"v59\", \"dataset_frozen\": false, \"blocked_rows\": 20}")
out=root/'data/runtime/v59_dataset_freeze.last.json'
out.parent.mkdir(parents=True, exist_ok=True)
prefix=''
out.write_text(prefix+json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print("v59 dataset v58.0 freeze gate: blocked until real evidence")
