#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
release=json.loads((root/'data/deployment/production_release_certificate_v54.json').read_text(encoding='utf-8'))
out=root/'docs/production_release_certificate_v54.generated.md'
lines=['# Production Release Certificate v54','',f"Status: {release['summary']['certificate_status']}",'', '## Checks']
for check in release.get('checks',[]): lines.append(f"- {check['check_id']}: {check['name']} — {check['status']}")
lines.append('')
lines.append('Production release allowed: false until real VPS evidence and final signoff are attached.')
out.write_text('\n'.join(lines)+'\n', encoding='utf-8')
print('v54 production release certificate report generated')
