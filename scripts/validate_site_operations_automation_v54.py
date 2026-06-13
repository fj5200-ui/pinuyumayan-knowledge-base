#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
site=json.loads((root/'data/site/operations_monitoring_automation_v54.json').read_text(encoding='utf-8'))
if len(site.get('routes',[])) < 7: raise SystemExit('v54 site ops requires at least 7 routes')
for route in site['routes']:
    if not all(route.get(k) for k in ['uptime_probe','cwv_probe','lighthouse_probe','og_check','sitemap_check']): raise SystemExit('route missing required probes: '+route.get('route_path','?'))
if site.get('summary',{}).get('minimum_contrast') != 'WCAG AA': raise SystemExit('WCAG AA required')
print(f"site operations automation v54 OK: {len(site['routes'])} routes")
