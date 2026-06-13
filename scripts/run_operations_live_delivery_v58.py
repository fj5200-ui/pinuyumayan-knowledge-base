#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
site=json.loads((root/'data/site/operations_live_delivery_v58.json').read_text(encoding='utf-8'))
(root/'data/runtime').mkdir(exist_ok=True)
(root/'data/runtime/v58_operations_live_delivery.last.json').write_text(json.dumps({'version':'v58','jobs':len(site['report_jobs']),'live_delivery_verified':False},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f"v58 operations live delivery contract: {len(site['report_jobs'])} jobs across {', '.join(site['summary']['channels'])}")
