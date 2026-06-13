#!/usr/bin/env python3
from __future__ import annotations
import json, os
from pathlib import Path
root=Path.cwd()
if not os.environ.get('DATABASE_URL'):
    print('DATABASE_URL missing; v56 release evidence ingest remains contract-only')
else:
    print('v56 release evidence ingest would write immutable VPS evidence using DATABASE_URL')
(root/'data/runtime').mkdir(exist_ok=True)
(root/'data/runtime/v56_release_evidence_ingest.last.json').write_text(json.dumps({'version':'v56','executed':'contract_only','database_url_present':bool(os.environ.get('DATABASE_URL'))},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
