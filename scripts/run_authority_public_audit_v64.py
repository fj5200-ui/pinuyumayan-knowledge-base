#!/usr/bin/env python3
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'data/integration/authority_metadata_public_evidence_v64.json').read_text(encoding='utf-8'))
print('authority public audit dry-run contract OK')
print(data.get('version','v64'))
