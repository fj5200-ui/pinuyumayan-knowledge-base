#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
out=root/'docs'/'build_final_seal_report_v60.generated.md'
out.parent.mkdir(parents=True, exist_ok=True)
payload=json.loads((root/'data/deployment/release_certificate_final_seal_v60.json').read_text(encoding='utf-8'))
lines=['# v60 Release Certificate Final Seal Report', '', f"Version: {payload.get('version')}", '', '狀態：此報告為可執行合約與 evidence gate；未連真實 VPS 或未上傳真實附件前，不標示為完成。', '', '```json', json.dumps(payload.get('summary',{}), ensure_ascii=False, indent=2), '```', '']
out.write_text('\n'.join(lines),encoding='utf-8')
print('v60 final seal report generated')
