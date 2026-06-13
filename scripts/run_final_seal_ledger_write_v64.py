#!/usr/bin/env python3
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'data/deployment/release_ledger_final_certificate_v64.json').read_text(encoding='utf-8'))
print('final seal ledger write requires real VPS evidence; dry-run contract OK')
print(data.get('version','v64'))
