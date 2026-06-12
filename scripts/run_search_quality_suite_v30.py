#!/usr/bin/env python3
import argparse,json,time,urllib.parse,urllib.request
from pathlib import Path

def get_json(url):
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            return {"ok": True, "status": r.status, "body": r.read(8000).decode('utf-8','ignore')}
    except Exception as e:
        return {"ok": False, "error": str(e), "body": ""}

def main():
    ap=argparse.ArgumentParser(description='Run v30 search quality smoke suite against deployed KB API')
    ap.add_argument('--base-url', default='http://localhost:8787')
    ap.add_argument('--suite', default='data/search/search_quality_suite_v30.json')
    ap.add_argument('--out', default='data/search/search_quality_report_v30.generated.json')
    args=ap.parse_args()
    suite=json.load(open(args.suite,encoding='utf-8'))
    results=[]
    for q in suite.get('queries',[]):
        url=args.base_url.rstrip('/') + '/api/public/knowledge/search?q=' + urllib.parse.quote(q['q'])
        res=get_json(url); body=res.get('body','')
        forbidden_hits=[f for f in q.get('forbid',[]) if f.lower() in body.lower()]
        results.append({"q":q['q'],"ok":bool(res.get('ok') and not forbidden_hits),"status":res.get('status'),"forbidden_hits":forbidden_hits,"target":url})
    passed=sum(1 for r in results if r['ok'])
    report={"version":"v30","generated_at":time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),"passed":passed,"failed":len(results)-passed,"status":"passed" if passed==len(results) else "failed","results":results}
    out=Path(args.out); out.parent.mkdir(parents=True,exist_ok=True); out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 0 if report['status']=='passed' else 2
if __name__=='__main__':
    raise SystemExit(main())
