#!/usr/bin/env python3
from __future__ import annotations
import json, hashlib
from pathlib import Path
root=Path.cwd()
data=json.loads((root/'data/deployment/production_evidence_backfill_v53.json').read_text(encoding='utf-8'))
out={'version':'v53','source':'production_evidence_backfill_v53','checks':len(data.get('checks',[])),'real_evidence_attached':data.get('summary',{}).get('real_evidence_attached',False),'release_allowed':False,'report_hash':hashlib.sha256(json.dumps(data,ensure_ascii=False,sort_keys=True).encode()).hexdigest()}
(root/'data/deployment/production_evidence_backfill_report_v53.generated.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(root/'docs/production_evidence_backfill_report_v53.generated.md').write_text('# v53 Production Evidence Backfill Report\n\nReal VPS evidence attached: false. Release remains blocked until health, DNS, rollback, backup restore and 30-minute observation evidence is uploaded.\n',encoding='utf-8')
print('v53 production evidence backfill report generated')
