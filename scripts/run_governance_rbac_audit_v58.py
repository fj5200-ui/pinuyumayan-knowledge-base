#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
gov=json.loads((root/'data/audio/speech_governance_rbac_download_v58.json').read_text(encoding='utf-8'))
(root/'data/runtime').mkdir(exist_ok=True)
(root/'data/runtime/v58_governance_rbac.last.json').write_text(json.dumps({'version':'v58','permission_tests':len(gov['permission_tests']),'audit_export_ready':True},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f"v58 governance RBAC audit: {len(gov['permission_tests'])} permission tests")
