#!/usr/bin/env python3
import argparse, json, os, time, urllib.request
from pathlib import Path

def check_env(name, required=True):
    v=os.environ.get(name)
    return {"id":f"env_{name}","ok":bool(v) or not required,"value":"set" if v else "missing"}

def http_get(url, timeout=5):
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:
            return {"ok":200 <= r.status < 300, "status": r.status}
    except Exception as e:
        return {"ok":False,"error":str(e)}

def main():
    ap=argparse.ArgumentParser(description="Build v30 production cutover readiness report")
    ap.add_argument('--base-url', default=os.environ.get('PUBLIC_KNOWLEDGE_BASE_URL','http://localhost:8787'))
    ap.add_argument('--main-site-url', default=os.environ.get('NEXT_PUBLIC_SITE_URL','https://pinuyumayan.tw'))
    ap.add_argument('--out', default='data/ops/production_cutover_readiness_v30.generated.json')
    args=ap.parse_args()
    checks=[check_env(n) for n in ['DATABASE_URL','MAIN_SITE_API_KEY','PINUYUMAYAN_HMAC_SECRET','ADMIN_SESSION_SECRET','ALLOWED_ORIGINS']]
    checks += [
      {"id":"knowledge_data_mode_db","ok":os.environ.get('KNOWLEDGE_DATA_MODE')=='db',"value":os.environ.get('KNOWLEDGE_DATA_MODE','unset')},
      {"id":"disable_static_fallback","ok":os.environ.get('DISABLE_PRODUCTION_STATIC_FALLBACK')=='true',"value":os.environ.get('DISABLE_PRODUCTION_STATIC_FALLBACK','unset')},
      {"id":"hmac_enabled","ok":os.environ.get('PINUYUMAYAN_HMAC_ENABLED')=='true',"value":os.environ.get('PINUYUMAYAN_HMAC_ENABLED','unset')},
      {"id":"kb_health","target":args.base_url.rstrip('/')+'/health', **http_get(args.base_url.rstrip('/')+'/health')},
      {"id":"kb_ready","target":args.base_url.rstrip('/')+'/ready', **http_get(args.base_url.rstrip('/')+'/ready')},
    ]
    passed=sum(1 for c in checks if c.get('ok')); failed=len(checks)-passed
    report={"version":"v30","generated_at":time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),"base_url":args.base_url,"main_site_url":args.main_site_url,"passed":passed,"failed":failed,"status":"passed" if failed==0 else "failed","checks":checks}
    out=Path(args.out); out.parent.mkdir(parents=True, exist_ok=True); out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 0 if failed==0 else 2
if __name__=='__main__':
    raise SystemExit(main())
