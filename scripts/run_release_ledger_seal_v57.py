#!/usr/bin/env python3
from __future__ import annotations
import json, os
from pathlib import Path
root=Path.cwd()
print('v57 release ledger seal:', 'DATABASE_URL present' if os.environ.get('DATABASE_URL') else 'contract-only; DATABASE_URL missing')
(root/'data/runtime').mkdir(exist_ok=True)
(root/'data/runtime/v57_release_ledger_seal.last.json').write_text(json.dumps({'version':'v57','executed':'contract_only','database_url_present':bool(os.environ.get('DATABASE_URL'))},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
