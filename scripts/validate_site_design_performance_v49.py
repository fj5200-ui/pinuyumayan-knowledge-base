#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
site=json.loads((root/'data/site/main_site_design_system_performance_v49.json').read_text(encoding='utf-8'))
if site.get('summary',{}).get('minimum_contrast') != 'WCAG AA': raise SystemExit('v49 site contrast must be WCAG AA')
if not site.get('summary',{}).get('core_web_vitals_budget_ready'): raise SystemExit('v49 CWV budget missing')
if len(site.get('route_validations',[])) < 6: raise SystemExit('v49 route validations too few')
for row in site.get('route_validations',[]):
    b=row.get('core_web_vitals_budget',{})
    if b.get('LCP_ms',9999)>2600 or b.get('INP_ms',9999)>200 or b.get('CLS',9)>0.1: raise SystemExit('v49 performance budget too loose')
print(f"site design/performance v49 OK: {len(site.get('route_validations',[]))} routes")
