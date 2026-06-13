#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
site=json.loads((root/'data/site/operations_report_notifications_v57.json').read_text(encoding='utf-8'))
if len(site.get('routes',[])) < 7: raise SystemExit('v57 operations notifications require 7 routes')
channels=set(site.get('summary',{}).get('channels',[]))
if not {'email','line','admin_notification'}.issubset(channels): raise SystemExit('v57 operations notifications missing required channels')
for route in site['routes']:
    for check in ['uptime','error_rate','CWV','Lighthouse','OG','sitemap']:
        if check not in route.get('checks',[]): raise SystemExit(f'v57 route missing {check}')
print(f"site operations notifications v57 OK: {len(site['routes'])} routes, {len(site['report_jobs'])} report jobs")
