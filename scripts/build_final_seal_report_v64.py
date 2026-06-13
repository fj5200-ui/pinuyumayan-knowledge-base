#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'data/deployment/release_ledger_final_certificate_v64.json').read_text(encoding='utf-8'))
out=root/'docs/release_certificate_final_seal_v64.generated.md'
checks=data.get('checks',[])
out.write_text('# v64 release certificate final seal report\n\n' + f"Certificate: `{data.get('certificate_id')}`\n\n" + f"Checks: {len(checks)}\n\n" + 'State: pending real VPS final seal evidence.\n', encoding='utf-8')
print('v64 final seal report generated')
