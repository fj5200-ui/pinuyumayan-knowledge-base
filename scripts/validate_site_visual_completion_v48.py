#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
site=json.loads((ROOT/'data/site/main_site_visual_completion_v48.json').read_text(encoding='utf-8'))
if site.get('summary',{}).get('minimum_contrast')!='WCAG AA': raise SystemExit('v48 site must require WCAG AA')
if not site.get('summary',{}).get('day_night_tokens_unified'): raise SystemExit('v48 day/night tokens not unified')
if len(site.get('route_audits',[])) < 6: raise SystemExit('v48 route audit too small')
if not any('no audio download' in x.lower() for x in site.get('post_deploy_checks',[])): raise SystemExit('v48 missing no audio download guard')
print(f"site visual completion v48 OK: {len(site.get('route_audits',[]))} routes")
