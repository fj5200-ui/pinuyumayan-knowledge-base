#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
site=json.loads((root/'data/site/operations_cadence_v56.json').read_text(encoding='utf-8'))
if len(site.get('monitors',[])) < 7: raise SystemExit('v56 operations cadence requires 7 monitored routes')
for monitor in site['monitors']:
    if monitor.get('minimum_contrast') != 'WCAG AA': raise SystemExit('v56 route missing WCAG AA contrast contract')
    for check in ['uptime','error_rate','CWV','Lighthouse','OG','sitemap']:
        if check not in monitor.get('checks',[]): raise SystemExit(f'v56 monitor missing {check}')
print(f"site operations cadence v56 OK: {len(site['monitors'])} routes")
