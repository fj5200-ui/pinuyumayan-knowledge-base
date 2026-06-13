#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
site=json.loads((root/'data/site/operations_report_notifications_v57.json').read_text(encoding='utf-8'))
print(f"v57 operations notifications contract: {len(site['report_jobs'])} jobs across {', '.join(site['summary']['channels'])}")
(root/'data/runtime').mkdir(exist_ok=True)
(root/'data/runtime/v57_operations_notifications.last.json').write_text(json.dumps({'version':'v57','jobs':len(site['report_jobs']),'live_delivery_attached':False},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
