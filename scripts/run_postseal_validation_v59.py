#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
(root/'data/runtime').mkdir(exist_ok=True)
obj=json.loads("{\"version\": \"v59\", \"real_vps_evidence_attached\": false}")
out=root/'data/runtime/v59_postseal_validation.last.json'
out.parent.mkdir(parents=True, exist_ok=True)
prefix=''
out.write_text(prefix+json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print("v59 post-seal validation: contract-only; waiting for real VPS evidence")
