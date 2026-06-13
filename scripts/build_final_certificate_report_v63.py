#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
data=json.loads((root/'data/deployment/release_ledger_final_certificate_v63.json').read_text(encoding='utf-8'))
out=root/'docs/release_ledger_final_certificate_v63.generated.md'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text("# " + data.get('title','v63 report') + "\n\n```json\n" + json.dumps(data, ensure_ascii=False, indent=2) + "\n```\n", encoding='utf-8')
print('v63 final certificate report generated')
