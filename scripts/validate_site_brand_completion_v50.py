#!/usr/bin/env python3
import json
from pathlib import Path
root=Path.cwd()
site=json.loads((root/'data/site/frontstage_brand_completion_v50.json').read_text(encoding='utf-8'))
brand=site.get('brand_system',{})
if brand.get('name') != '卑南族文化綜合平台': raise SystemExit('wrong platform name')
if 'legacy_cn_forbidden_label' not in brand.get('forbidden_labels',[]): raise SystemExit('forbidden label guard missing')
for route in site.get('route_brand_validations',[]):
    if route.get('cwv_budget',{}).get('LCP_ms',9999)>2500: raise SystemExit('LCP budget too loose')
    if route.get('screenshot_required') is not True or route.get('og_required') is not True: raise SystemExit('screenshot/OG required for all routes')
print(f"site brand completion v50 OK: {len(site.get('route_brand_validations',[]))} routes")
