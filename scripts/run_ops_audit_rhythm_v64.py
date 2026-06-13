#!/usr/bin/env python3
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'data/site/operations_delivery_audit_rhythm_v64.json').read_text(encoding='utf-8'))
print('ops audit rhythm dry-run contract OK')
print(data.get('version','v64'))
