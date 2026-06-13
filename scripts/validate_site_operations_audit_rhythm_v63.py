#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
ops=json.loads((root/'data/site/operations_delivery_audit_rhythm_v63.json').read_text(encoding='utf-8'))
assert len(ops.get('routes',[])) == 7, 'v63 monitored routes must be 7'
assert len(ops.get('jobs',[])) == 6, 'v63 delivery jobs must be 6'
assert ops.get('summary',{}).get('ack_close_loop_ready') is True, 'ack/close loop must be ready'
print(f"site operations delivery audit rhythm v63 OK: {len(ops.get('routes',[]))} routes, {len(ops.get('jobs',[]))} report jobs")
