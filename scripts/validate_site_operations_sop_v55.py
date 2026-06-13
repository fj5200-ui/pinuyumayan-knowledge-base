#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
site=json.loads((root/'data/site/operations_monitoring_sop_v55.json').read_text(encoding='utf-8'))
if site.get('summary',{}).get('minimum_contrast') != 'WCAG AA': raise SystemExit('v55 ops SOP must retain WCAG AA')
if len(site.get('monitors',[])) < 7: raise SystemExit('v55 ops SOP must cover at least 7 routes')
for monitor in site['monitors']:
    if not monitor.get('og_required') or not monitor.get('sitemap_required'): raise SystemExit('v55 monitor missing OG/sitemap requirement')
    if monitor.get('lighthouse_budget',{}).get('accessibility',0) < 90: raise SystemExit('v55 accessibility budget too low')
print(f"site operations SOP v55 OK: {len(site['monitors'])} routes")
