#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
release=json.loads((root/'data/deployment/production_release_certificate_v54.json').read_text(encoding='utf-8'))
if release.get('summary',{}).get('production_release_allowed') is not False: raise SystemExit('unsafe release flag')
print('v54 release certificate rehearsal OK: contract only; attach real VPS evidence before production release')
