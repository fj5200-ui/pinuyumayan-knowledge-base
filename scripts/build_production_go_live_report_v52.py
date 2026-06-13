#!/usr/bin/env python3
from __future__ import annotations
import json, hashlib
from pathlib import Path
root=Path.cwd()
source=root/'data/deployment/production_go_live_execution_v52.json'
out=root/'data/deployment/production_go_live_execution_v52.generated.json'
data=json.loads(source.read_text(encoding='utf-8'))
steps=data.get('execution_steps',[])
report={
  'version':'v52','source':'data/deployment/production_go_live_execution_v52.json',
  'step_count':len(steps),'ready_count':sum(1 for s in steps if s.get('status')=='ready_for_real_vps_execution'),
  'release_allowed':False,'reason':'real VPS execution and 30 minute observation evidence are still required',
  'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest()
}
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print('v52 production go-live report generated')
