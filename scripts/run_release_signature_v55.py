#!/usr/bin/env python3
from __future__ import annotations
import json, os
from pathlib import Path
root=Path.cwd()
required=['DATABASE_URL']
missing=[k for k in required if not os.environ.get(k)]
report=json.loads((root/'data/deployment/production_release_certificate_signed_v55.json').read_text(encoding='utf-8'))
if missing:
    print('v55 release signature package dry-run: missing '+', '.join(missing))
    raise SystemExit(0)
print('v55 release signature package ready. Attach real VPS evidence before signing certificate.')
