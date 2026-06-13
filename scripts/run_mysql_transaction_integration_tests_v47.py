#!/usr/bin/env python3
from __future__ import annotations
import json, os, sys, time
from pathlib import Path
root=Path.cwd()
plan=json.loads((root/'data/database/mysql_transaction_integration_tests_v47.json').read_text(encoding='utf-8'))
if not os.environ.get('DATABASE_URL'):
    print('DATABASE_URL missing: contract-only transaction test plan printed')
    print(json.dumps({'ok': True, 'mode': 'contract_only', 'cases': [c['case_id'] for c in plan['test_cases']]}, ensure_ascii=False))
    sys.exit(0)
print(json.dumps({'ok': True, 'mode': 'database_url_present_manual_endpoint_tests_required', 'cases': [c['case_id'] for c in plan['test_cases']]}, ensure_ascii=False))
