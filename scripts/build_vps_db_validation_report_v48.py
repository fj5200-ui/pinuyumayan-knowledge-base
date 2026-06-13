#!/usr/bin/env python3
from __future__ import annotations
import json, hashlib, os
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
base = json.loads((ROOT/'data/database/vps_db_validation_report_v48.json').read_text(encoding='utf-8'))
checks = base.get('checks', [])
for c in checks:
    if c['status'] in ('contract_ready','pending_vps_run'):
        c['observed_status'] = 'not_run_without_database_url' if not os.environ.get('DATABASE_URL') else 'ready_for_vps_probe'
base['generated_report'] = True
base['summary']['checks_total'] = len(checks)
base['migration_checksum'] = hashlib.sha256((ROOT/'database/migrations/0044_tts_stt_music_v48.sql').read_bytes()).hexdigest()
base['seed_checksum'] = hashlib.sha256('\n'.join(p.read_text(encoding='utf-8') for p in sorted((ROOT/'database/seeds').glob('044_*.sql'))).encode()).hexdigest()
out = ROOT/'data/database/vps_db_validation_report_v48.generated.json'
out.write_text(json.dumps(base, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(f'wrote {out.relative_to(ROOT)} with {len(checks)} checks')
