#!/usr/bin/env python3
from __future__ import annotations
import json, os, time, hashlib
from pathlib import Path
root=Path.cwd()
out=root/'data/deployment/production_go_live_execution_v52.runtime.json'
run={
  'version':'v52','mode':'local_rehearsal' if not os.environ.get('DATABASE_URL') else 'vps_rehearsal',
  'database_url_present':bool(os.environ.get('DATABASE_URL')),
  'recorded_at':time.strftime('%Y-%m-%dT%H:%M:%S%z'),
  'release_allowed':False,
  'reason':'This runner records rehearsal metadata only; final cutover requires operator signoff and external DNS/Cloudflare evidence.'
}
run['run_hash']=hashlib.sha256(json.dumps(run, sort_keys=True).encode()).hexdigest()
out.write_text(json.dumps(run, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print('v52 go-live execution rehearsal recorded')
