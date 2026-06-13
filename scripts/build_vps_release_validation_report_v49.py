#!/usr/bin/env python3
from __future__ import annotations
import json, hashlib
from pathlib import Path
root=Path.cwd()
report=json.loads((root/'data/database/vps_release_validation_report_v49.json').read_text(encoding='utf-8'))
checks=report.get('checks',[])
generated={**report,'generated_report':True,'checks_passed_contract':sum(1 for c in checks if c.get('status') in {'passed','recorded'}),'checks_pending_vps_run':sum(1 for c in checks if c.get('status') == 'pending_vps_run'),'release_allowed':False}
out=root/'data/database/vps_release_validation_report_v49.generated.json'
out.write_text(json.dumps(generated, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(f"v49 release validation report generated: {out}")
