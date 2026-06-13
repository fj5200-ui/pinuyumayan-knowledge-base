#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
site=json.loads((root/'data/site/brand_performance_validation_v51.json').read_text(encoding='utf-8'))
if site.get('summary',{}).get('minimum_contrast') != 'WCAG AA': raise SystemExit('v51 site contrast requirement invalid')
if len(site.get('routes',[])) < 7: raise SystemExit('v51 site routes missing')
for route in site['routes']:
    if not route.get('lighthouse_required') or not route.get('cwv_required') or not route.get('browser_screenshot_required'):
        raise SystemExit(f"v51 route missing validation flags: {route.get('route_path')}")
print(f"site brand performance v51 OK: {len(site.get('routes',[]))} routes")
