#!/usr/bin/env python3
from pathlib import Path
import json
root=Path.cwd()
site=json.loads((root/'data/site/music_site_polish_v47.json').read_text(encoding='utf-8'))
page=(root/'webapp/app/music/search/page.tsx').read_text(encoding='utf-8')
checks=['Music Search v47 polished experience layer','bg-white/95','v47_query_log_wired','metadata-only','text-zinc-950','text-yellow-950']
missing=[c for c in checks if c not in page]
if missing: raise SystemExit('site polish page missing: '+', '.join(missing))
if site['day_mode_tokens']['minimum_contrast']!='WCAG AA': raise SystemExit('day contrast token invalid')
print('site polish v47 OK: day-mode contrast tokens, metadata-only guard, v47 query log wording')
