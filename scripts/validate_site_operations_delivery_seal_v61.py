#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
ops=json.loads((root/'data/site/operations_notification_delivery_seal_v61.json').read_text(encoding='utf-8'))
if len(ops.get('routes',[])) < 7: raise SystemExit('v61 operations routes missing')
if len(ops.get('jobs',[])) < 6: raise SystemExit('v61 delivery jobs missing')
for job in ops.get('jobs',[]):
    if not job.get('ack_required') or not job.get('close_required'):
        raise SystemExit('v61 delivery job must require ack and close')
print(f"site operations delivery seal v61 OK: {len(ops.get('routes',[]))} routes, {len(ops.get('jobs',[]))} delivery jobs")
