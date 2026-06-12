#!/usr/bin/env python3
import json, pathlib, argparse, hashlib
p=argparse.ArgumentParser(); p.add_argument('--out', default='data/search/music_fulltext_seed_v42.generated.sql'); args=p.parse_args()
root=pathlib.Path(__file__).resolve().parents[1]
docs=json.loads((root/'data/search/public_search_documents_v42.json').read_text(encoding='utf-8'))['documents']
blocked=['卑南文化遺址','卑南遺址','Peinan Site','Beinan Site','Peinan Archaeological Site']
lines=['-- generated v42 music search index seed']
count=0
for d in docs:
    text=json.dumps(d,ensure_ascii=False)
    if any(b in text for b in blocked): continue
    doc_id=d['id'].replace("'","''"); title=d['title'].replace("'","''"); body=d['body'].replace("'","''")
    h=hashlib.sha256(text.encode()).hexdigest()
    lines.append(f"INSERT INTO search_index_documents_v27 (document_key,title,body,source_hash,created_at) VALUES ('{doc_id}','{title}','{body}','{h}',CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE title=VALUES(title), body=VALUES(body), source_hash=VALUES(source_hash);")
    count+=1
(root/args.out).parent.mkdir(parents=True, exist_ok=True); (root/args.out).write_text('\n'.join(lines)+'\n', encoding='utf-8')
print(json.dumps({'version':'v42','indexed_documents':count},ensure_ascii=False))
