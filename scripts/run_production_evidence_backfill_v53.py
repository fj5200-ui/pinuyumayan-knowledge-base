#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
contract=json.loads((root/'data/deployment/production_evidence_backfill_v53.json').read_text(encoding='utf-8'))
print(f"v53 evidence backfill contract ready: {len(contract.get('checks',[]))} checks; real VPS evidence is still required")
