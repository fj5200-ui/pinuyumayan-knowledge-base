#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
site=json.loads((root/'data/site/formal_monitoring_operations_v53.json').read_text(encoding='utf-8'))
if site.get('summary',{}).get('minimum_contrast') != 'WCAG AA': raise SystemExit('v53 site contrast requirement invalid')
if len(site.get('routes',[])) < 7: raise SystemExit('v53 site routes missing')
for route in site['routes']:
    for k in ['uptime_probe','lighthouse_required','cwv_required','og_required','sitemap_required','daily_report','weekly_report']:
        if not route.get(k): raise SystemExit(f"v53 monitoring flag missing {k}: {route.get('route_path')}")
    if route.get('latency_p95_ms_budget',99999) > 1000 or route.get('error_rate_threshold',1) > 0.02:
        raise SystemExit(f"v53 monitoring budget invalid: {route.get('route_path')}")
print(f"site formal monitoring v53 OK: {len(site.get('routes',[]))} routes")
