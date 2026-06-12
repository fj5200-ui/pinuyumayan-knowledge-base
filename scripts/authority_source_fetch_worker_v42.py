#!/usr/bin/env python3
"""Metadata-only authority source worker contract.
This script intentionally does not download lyrics, audio, or video.
"""
import argparse, json, pathlib, hashlib, datetime
p=argparse.ArgumentParser(); p.add_argument('--adapter', default='dry_run'); p.add_argument('--query', default='卑南族 歌謠 metadata'); p.add_argument('--out', default='data/sources/authority_fetch_report_v42.generated.json'); args=p.parse_args()
blocked=['卑南文化遺址','卑南遺址','Peinan Site','Beinan Site','Peinan Archaeological Site']
report={'version':'v42','adapter':args.adapter,'query':args.query,'mode':'metadata_candidate_only','fetched_count':0,'accepted_candidate_count':0,'blocked_count':0,'blocked_terms':[t for t in blocked if t in args.query],'generated_at':datetime.datetime.utcnow().isoformat()+'Z','note':'Provide live adapter credentials and parser implementation on VPS; do not fetch lyrics/audio/video.'}
report['report_hash']=hashlib.sha256(json.dumps(report,sort_keys=True).encode()).hexdigest()
root=pathlib.Path(__file__).resolve().parents[1]; (root/args.out).parent.mkdir(parents=True, exist_ok=True); (root/args.out).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n', encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
