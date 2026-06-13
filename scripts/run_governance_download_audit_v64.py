#!/usr/bin/env python3
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'data/audio/speech_governance_audit_delivery_v64.json').read_text(encoding='utf-8'))
print('governance download audit dry-run contract OK')
print(data.get('version','v64'))
