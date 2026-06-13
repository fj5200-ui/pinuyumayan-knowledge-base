#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
cert=json.loads((root/'data/deployment/production_release_certificate_signed_v55.json').read_text(encoding='utf-8'))
out=root/'docs/production_release_certificate_signed_v55.generated.md'
lines=['# Production Release Certificate v55','',f"Certificate ID: `{cert.get('certificate_id')}`",'',f"Signed: `{cert.get('summary',{}).get('release_certificate_signed')}`",'',f"Production release allowed: `{cert.get('summary',{}).get('production_release_allowed')}`",'', '## Required checks']
for c in cert.get('checks',[]): lines.append(f"- {c['check_key']}: {c['status']}")
lines.append('')
lines.append(f"Certificate hash: `{cert.get('certificate_hash')}`")
out.write_text('\n'.join(lines)+'\n', encoding='utf-8')
print('v55 signed release certificate report generated')
