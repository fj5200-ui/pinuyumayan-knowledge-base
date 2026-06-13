#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
out=root/'docs'/'run_dataset_real_output_v61.generated.md'
out.parent.mkdir(parents=True, exist_ok=True)
payload=json.loads((root/'data/security/legal_speech_dataset_real_output_v61.json').read_text(encoding='utf-8'))
lines=['# v61 Dataset Real Output Gate', '', f"Version: {payload.get('version')}", '', '狀態：此報告為實機落地/封板 evidence gate；未連真實 VPS 或未上傳真實附件前，不標示為完成。', '', '```json', json.dumps(payload.get('summary',{}), ensure_ascii=False, indent=2), '```', '']
out.write_text('\n'.join(lines),encoding='utf-8')
print('v61 dataset real output gate checked')
