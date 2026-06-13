#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
g=json.loads((root/'data/integration/authority_source_governance_v46.json').read_text(encoding='utf-8'))
report={'version':'v46','generated_from':'scripts/build_authority_source_governance_v46.py','policy_count':len(g.get('fetch_policies',[])),'retry_queue_count':len(g.get('retry_queue_seed',[])),'merge_request_count':len(g.get('candidate_merge_requests',[])),'public_auto_release':False,'robots_tos_review_required':True}
(root/'data/integration/authority_source_retry_merge_report_v46.generated.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f"v46 authority governance OK: {report['policy_count']} policies")
