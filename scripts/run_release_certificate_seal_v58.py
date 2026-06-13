#!/usr/bin/env python3
from __future__ import annotations
import json, os
from pathlib import Path
root=Path.cwd()
(root/'data/runtime').mkdir(exist_ok=True)
result={'version':'v58','executed':'contract_only','database_url_present':bool(os.environ.get('DATABASE_URL')),'production_release_certificate_sealed':False}
(root/'data/runtime/v58_release_certificate_seal.last.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('v58 release certificate seal:', 'DATABASE_URL present' if result['database_url_present'] else 'contract-only; DATABASE_URL missing')
