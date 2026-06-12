#!/usr/bin/env python3
import argparse, json, pathlib, re, datetime
parser=argparse.ArgumentParser()
parser.add_argument('--target', required=True)
parser.add_argument('--out', required=True)
args=parser.parse_args()
target=pathlib.Path(args.target)
patterns=['OPENAI_API_KEY','KIMI_API_KEY','PINUYUMAYAN_HMAC_SECRET','PINUYUMAYAN_MAIN_SITE_API_KEY','MAIN_SITE_API_KEY']
server_ok_parts=['/api/','/server/','server.ts','route.ts']
findings=[]
if target.exists():
    for p in target.rglob('*'):
        if p.is_file() and p.suffix in {'.ts','.tsx','.js','.jsx','.env','.md'}:
            text=p.read_text(errors='ignore')
            for pat in patterns:
                if pat in text:
                    rel='/'+str(p.relative_to(target)).replace('\\','/')
                    server_allowed=any(part in rel for part in server_ok_parts)
                    if not server_allowed or p.suffix in {'.tsx','.jsx'}:
                        findings.append({'file':str(p.relative_to(target)),'pattern':pat,'severity':'high'})
else:
    findings.append({'file':str(target),'pattern':'target_missing','severity':'blocked'})
output={'version':'v32','target':str(target),'status':'failed' if findings else 'passed','finding_count':len(findings),'findings':findings,'generated_at':datetime.datetime.utcnow().isoformat()+'Z'}
pathlib.Path(args.out).parent.mkdir(parents=True,exist_ok=True)
pathlib.Path(args.out).write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'status':output['status'],'finding_count':len(findings)},ensure_ascii=False))
