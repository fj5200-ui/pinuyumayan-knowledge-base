#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
release=json.loads((root/'data/deployment/release_evidence_ledger_seal_v57.json').read_text(encoding='utf-8'))
legal=json.loads((root/'data/security/legal_speech_train_dev_test_v57.json').read_text(encoding='utf-8'))
report={'version':'v57','ledger_checks':len(release.get('checks',[])),'legal_candidates':len(legal.get('assets',[])),'real_evidence_attached':False,'dataset_export_allowed':False,'release_certificate_sealed':False}
out=root/'docs/release_evidence_ledger_seal_report_v57.generated.md'
out.write_text('# v57 Release Evidence Ledger Seal Report\n\n'+json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('v57 release evidence ledger seal report generated')
