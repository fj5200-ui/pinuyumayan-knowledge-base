#!/usr/bin/env python3
from __future__ import annotations
import json, os
from pathlib import Path
root=Path.cwd()
legal=json.loads((root/'data/security/legal_speech_unblocked_dataset_v55.json').read_text(encoding='utf-8'))
allowed=legal.get('summary',{}).get('dataset_export_allowed') is True
print(f"v55 legal dataset unlock check: {legal.get('summary',{}).get('legally_unblocked_count',0)} unblocked / {len(legal.get('assets',[]))} candidates")
if not allowed: print('export blocked until real evidence upload, virus scan, hash chain and native speaker review complete')
