#!/usr/bin/env python3
"""Metadata-only YouTube worker contract for v41.
Does not download audio/video. Requires YOUTUBE_API_KEY for live API use.
"""
import argparse, json, os, sys, time, urllib.parse, urllib.request
FORBIDDEN = ["卑南文化遺址", "卑南遺址", "Peinan Site", "Beinan Site", "Peinan Archaeological Site"]
def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--query', action='append', default=[])
    ap.add_argument('--out', default='data/generated/youtube_metadata_candidates_v41.generated.json')
    ap.add_argument('--max-results', type=int, default=10)
    ap.add_argument('--live', action='store_true')
    args=ap.parse_args()
    queries=args.query or ['卑南族 歌謠','卑南族 古調','南王部落 歌謠']
    root=os.getcwd()
    candidates=[]; blocked=[]
    for q in queries:
        if any(t.lower() in q.lower() for t in FORBIDDEN):
            blocked.append({'query':q,'reason':'forbidden_relation'}); continue
        if args.live:
            key=os.environ.get('YOUTUBE_API_KEY')
            if not key: raise SystemExit('YOUTUBE_API_KEY required for --live')
            url='https://www.googleapis.com/youtube/v3/search?'+urllib.parse.urlencode({'part':'snippet','q':q,'type':'video','maxResults':args.max_results,'key':key})
            data=json.load(urllib.request.urlopen(url, timeout=20))
            for item in data.get('items',[]):
                sn=item.get('snippet',{})
                candidates.append({'query':q,'video_id':item.get('id',{}).get('videoId'),'title':sn.get('title'),'channel_title':sn.get('channelTitle'),'published_at':sn.get('publishedAt'),'thumbnail_url':(sn.get('thumbnails',{}).get('medium') or {}).get('url'),'rights_status':'unknown','review_status':'candidate_needs_human_review'})
            time.sleep(0.2)
        else:
            candidates.append({'query':q,'video_id':None,'title':f'preview metadata candidate for {q}','channel_title':None,'published_at':None,'thumbnail_url':None,'rights_status':'unknown','review_status':'preview_not_live_api'})
    out={'version':'v41','live':args.live,'metadata_only':True,'download_audio':False,'download_video':False,'candidate_count':len(candidates),'blocked_count':len(blocked),'candidates':candidates,'blocked':blocked}
    path=os.path.join(root,args.out); os.makedirs(os.path.dirname(path), exist_ok=True); open(path,'w',encoding='utf-8').write(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'ok':True,'out':args.out,'candidate_count':len(candidates),'blocked_count':len(blocked)}, ensure_ascii=False))
if __name__=='__main__': main()
