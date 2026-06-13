#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
ops=json.loads((root/'data/site/operations_notification_closed_loop_v59.json').read_text(encoding='utf-8'))
if len(ops.get('routes',[])) < 7: raise SystemExit('v59 operations closed loop requires 7 routes')
for job in ops.get('jobs',[]):
    if not (job.get('ack_required') and job.get('escalation_enabled') and job.get('close_required')):
        raise SystemExit('v59 closed-loop job missing ack/escalation/close')
print(f"site operations notification closed loop v59 OK: {len(ops['routes'])} routes, {len(ops['jobs'])} jobs")
