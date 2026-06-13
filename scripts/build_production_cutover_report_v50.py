#!/usr/bin/env python3
from __future__ import annotations
import json, hashlib
from pathlib import Path
root=Path.cwd()
cutover=json.loads((root/'data/deployment/production_cutover_v50.json').read_text(encoding='utf-8'))
report={
 'version':'v50','generated_from':'scripts/build_production_cutover_report_v50.py','release_allowed':False,
 'migration_checksum':hashlib.sha256((root/'database/migrations/0046_tts_stt_music_v50.sql').read_bytes()).hexdigest(),
 'seed_checksum':hashlib.sha256((root/'database/seeds/046_tts_stt_music_v50.sql').read_bytes()).hexdigest(),
 'checks':[{'check_id':c['check_id'],'status':'pending_real_vps_run','severity':c['severity']} for c in cutover.get('health_checks',[])],
 'cutover_steps':[{'step_id':s['step_id'],'status':s['status']} for s in cutover.get('cutover_steps',[])],
 'rollback_rehearsal_required':True,
 'cloudflare_cutover_required':True
}
out=root/'data/deployment/production_cutover_v50.generated.json'
out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('v50 production cutover report generated')
