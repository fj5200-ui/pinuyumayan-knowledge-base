#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
release=json.loads((root/'data/deployment/release_certificate_immutable_evidence_v56.json').read_text(encoding='utf-8'))
legal=json.loads((root/'data/security/legal_speech_real_export_v56.json').read_text(encoding='utf-8'))
report={'version':'v56','release_evidence_checks':len(release.get('checks',[])),'legal_candidates':len(legal.get('assets',[])),'real_vps_evidence_attached':False,'dataset_export_allowed':False}
out=root/'docs/release_evidence_ingest_report_v56.generated.md'
out.write_text('# v56 Release Evidence Ingest Report\n\n'+json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('v56 release evidence ingest report generated')
