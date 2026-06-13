#!/usr/bin/env python3
from __future__ import annotations
import json, os
from pathlib import Path
root=Path.cwd()
report={'version':'v50','mode':'contract_only' if not os.environ.get('DATABASE_URL') else 'database_url_present','rollback_rehearsal_executed':False,'reason':'Set RUN_CUTOVER_REHEARSAL=1 on VPS staging and provide DATABASE_URL/backups to execute real rehearsal.'}
out=root/'data/deployment/production_rollback_rehearsal_v50.generated.json'
out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('v50 rollback rehearsal contract generated')
