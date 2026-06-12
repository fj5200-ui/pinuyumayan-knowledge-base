#!/usr/bin/env python3
import json, pathlib, argparse, hashlib
parser=argparse.ArgumentParser(); parser.add_argument("--out", default="data/search/music_live_db_seed_v43.generated.sql"); args=parser.parse_args()
root=pathlib.Path.cwd(); docs=json.loads((root/"data/search/public_search_documents_v43.json").read_text(encoding="utf-8"))["documents"]
lines=["-- generated preview seed for v43 music live DB search", "CREATE TABLE IF NOT EXISTS music_search_documents_v43 (id VARCHAR(128) PRIMARY KEY, title TEXT, body TEXT, facets_json JSON, doc_hash VARCHAR(128));"]
for d in docs:
    h=hashlib.sha256(json.dumps(d,ensure_ascii=False,sort_keys=True).encode()).hexdigest(); title=d["title"].replace("'","''"); body=d["body"].replace("'","''"); facets=json.dumps(d.get("facets",{}),ensure_ascii=False).replace("'","''"); lines.append(f"INSERT INTO music_search_documents_v43 (id,title,body,facets_json,doc_hash) VALUES ('{d['id']}','{title}','{body}',CAST('{facets}' AS JSON),'{h}') ON DUPLICATE KEY UPDATE title=VALUES(title), body=VALUES(body), facets_json=VALUES(facets_json), doc_hash=VALUES(doc_hash);")
out=root/args.out; out.parent.mkdir(parents=True, exist_ok=True); out.write_text("\n".join(lines)+"\n",encoding="utf-8"); print(f"wrote {out} ({len(docs)} docs)")
