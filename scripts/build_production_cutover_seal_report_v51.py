#!/usr/bin/env python3
from __future__ import annotations
import json, hashlib
from pathlib import Path
root=Path.cwd()
source=root/'data/deployment/production_cutover_seal_v51.json'
out=root/'data/deployment/production_cutover_seal_v51.generated.json'
data=json.loads(source.read_text(encoding='utf-8'))
checks=data.get('seal_checklist',[])
report={
  'version':'v51',
  'source':'data/deployment/production_cutover_seal_v51.json',
  'check_count':len(checks),
  'passed_count':sum(1 for c in checks if c.get('status')=='passed'),
  'pending_count':sum(1 for c in checks if 'pending' in c.get('status','')),
  'release_allowed':False,
  'reason':'real VPS staging/production cutover evidence is still required',
  'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest()
}
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print('v51 production cutover seal report generated')
