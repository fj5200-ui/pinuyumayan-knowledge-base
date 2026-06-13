#!/usr/bin/env python3
from __future__ import annotations
import json, os
from pathlib import Path
root=Path.cwd()
contract=json.loads((root/'data/deployment/production_cutover_seal_v51.json').read_text(encoding='utf-8'))
if os.environ.get('ALLOW_REAL_CUTOVER_WRITE') != '1':
    print('v51 cutover seal rehearsal dry-run only. Set ALLOW_REAL_CUTOVER_WRITE=1 on VPS staging to record live evidence.')
    print(f"required checks: {len(contract.get('seal_checklist',[]))}")
else:
    print('v51 cutover seal live mode requested; use internal HMAC API endpoints to append evidence.')
