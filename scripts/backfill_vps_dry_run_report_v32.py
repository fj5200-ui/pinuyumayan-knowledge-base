#!/usr/bin/env python3
import argparse, json, hashlib, datetime, pathlib
parser=argparse.ArgumentParser()
parser.add_argument('--report', required=True)
parser.add_argument('--out', required=True)
args=parser.parse_args()
raw=pathlib.Path(args.report).read_bytes()
report=json.loads(raw.decode('utf-8'))
blockers=[]
if not report.get('actual_vps_run'):
    blockers.append('actual_vps_run_false')
for key in ['database','hmac','static_fallback','main_site']:
    value=report.get(key)
    if isinstance(value,dict) and value.get('status') in {'failed','missing','blocked'}:
        blockers.append(f'{key}_{value.get("status")}')
output={
  'version':'v32',
  'source_report':args.report,
  'report_sha256':hashlib.sha256(raw).hexdigest(),
  'actual_vps_run':bool(report.get('actual_vps_run')),
  'status':'blocked' if blockers else 'accepted_for_review',
  'blockers':blockers,
  'generated_at':datetime.datetime.utcnow().isoformat()+'Z',
  'report':report
}
pathlib.Path(args.out).parent.mkdir(parents=True,exist_ok=True)
pathlib.Path(args.out).write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f"wrote {args.out}: {output['status']}")
