#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
site=json.loads((root/'data/site/brand_performance_monitoring_v52.json').read_text(encoding='utf-8'))
if site.get('summary',{}).get('minimum_contrast') != 'WCAG AA': raise SystemExit('v52 site contrast requirement invalid')
if len(site.get('routes',[])) < 7: raise SystemExit('v52 site routes missing')
for route in site['routes']:
    if not route.get('screenshot_required') or not route.get('og_validation_required') or not route.get('sitemap_ping_required'):
        raise SystemExit(f"v52 route missing monitoring flags: {route.get('route_path')}")
    budgets=route.get('budgets',{})
    if budgets.get('LCP_ms',99999) > 2500 or budgets.get('CLS',1) > 0.1:
        raise SystemExit(f"v52 route budget invalid: {route.get('route_path')}")
print(f"site performance monitoring v52 OK: {len(site.get('routes',[]))} routes")
