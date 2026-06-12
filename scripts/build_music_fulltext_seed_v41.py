#!/usr/bin/env python3
import json, pathlib, argparse, re
ROOT=pathlib.Path(__file__).resolve().parents[1]
FORBIDDEN=['卑南文化遺址','卑南遺址','Peinan Site','Beinan Site','Peinan Archaeological Site']
def esc(s): return str(s or '').replace('\\','\\\\').replace("'","''")
def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--out', default='data/search/music_fulltext_seed_v41.generated.sql'); args=ap.parse_args()
    docs=[]
    for rel in ['data/search/public_search_documents_v40.json','data/search/public_search_documents_v41.json']:
        p=ROOT/rel
        if p.exists(): docs += json.loads(p.read_text(encoding='utf-8')).get('documents',[])
    rows=[]; blocked=0
    for d in docs:
        text=json.dumps(d, ensure_ascii=False)
        if any(t in text for t in FORBIDDEN): blocked+=1; continue
        doc_id=d.get('doc_id') or d.get('id')
        title=d.get('title_zh') or d.get('title') or doc_id
        body=d.get('body_zh') or d.get('summary_zh') or ''
        facets=d.get('facets',{})
        rows.append(f"('{esc(doc_id)}','{esc(title)}','{esc(body)}','{esc(facets.get('artist'))}','{esc(facets.get('community'))}','{esc(facets.get('work_type'))}','{esc(facets.get('rights') or facets.get('rights_status'))}','{esc(facets.get('sensitivity'))}','{esc(facets.get('source_authority'))}','{esc(facets.get('youtube_official_status'))}', JSON_ARRAY(), JSON_ARRAY())")
    sql='-- generated v41 music FULLTEXT seed\n'
    if rows:
        sql += 'INSERT INTO music_search_index_documents_v41 (doc_id,title_zh,body_zh,artist,community,work_type,rights_status,sensitivity,source_authority,youtube_official_status,claim_ids_json,source_ids_json) VALUES\n' + ',\n'.join(rows) + '\nON DUPLICATE KEY UPDATE title_zh=VALUES(title_zh), body_zh=VALUES(body_zh);\n'
    (ROOT/args.out).parent.mkdir(parents=True, exist_ok=True); (ROOT/args.out).write_text(sql,encoding='utf-8')
    print({'indexed':len(rows),'blocked':blocked,'out':args.out})
if __name__=='__main__': main()
