#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
workflow=json.loads((root/'data/audio/speech_review_workflow_v45.json').read_text(encoding='utf-8'))
queue=json.loads((root/'data/audio/speech_reviewer_queue_v46.json').read_text(encoding='utf-8'))
if len(queue.get('items',[])) != len(workflow.get('items',[])):
    raise SystemExit('reviewer queue count does not match v45 workflow')
print(f"v46 reviewer queue OK: {len(queue.get('items',[]))} items")
