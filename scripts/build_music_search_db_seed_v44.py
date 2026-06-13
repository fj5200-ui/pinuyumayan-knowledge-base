#!/usr/bin/env python3
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
from typing import Any


def q(value: Any) -> str:
    return str(value if value is not None else "").replace("'", "''")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="data/search/music_search_documents_v44.seed.json")
    parser.add_argument("--out", default="database/seeds/040_music_search_documents_v44.generated.sql")
    args = parser.parse_args()
    root = Path.cwd()
    data = json.loads((root / args.input).read_text(encoding="utf-8"))
    lines = ["-- generated v44 MySQL FULLTEXT music search seed"]
    for d in data.get("documents", []):
        blob = json.dumps(d, ensure_ascii=False, sort_keys=True)
        h = hashlib.sha256(blob.encode("utf-8")).hexdigest()
        facets = json.dumps(d.get("facets", {}), ensure_ascii=False)
        claim_ids = json.dumps(d.get("claim_ids", []), ensure_ascii=False)
        source_ids = json.dumps(d.get("source_ids", []), ensure_ascii=False)
        lines.append(
            "INSERT INTO music_search_documents_v43 "
            "(id,title,artist,community,work_type,summary,source_title,source_url,rights_status,sensitivity,source_authority,youtube_official_status,romanized_terms,body,facets_json,claim_ids_json,source_ids_json,review_status,public_visible,doc_hash) VALUES "
            f"('{q(d['id'])}','{q(d.get('title'))}','{q(d.get('artist'))}','{q(d.get('community'))}','{q(d.get('work_type'))}','{q(d.get('summary'))}','{q(d.get('source_title'))}',NULL,'{q(d.get('rights_status'))}','{q(d.get('sensitivity'))}','{q(d.get('source_authority'))}','{q(d.get('youtube_official_status'))}','{q(d.get('romanized_terms'))}','{q(d.get('body'))}',CAST('{q(facets)}' AS JSON),CAST('{q(claim_ids)}' AS JSON),CAST('{q(source_ids)}' AS JSON),'{q(d.get('review_status'))}',{1 if d.get('public_visible') else 0},'{h}') "
            "ON DUPLICATE KEY UPDATE title=VALUES(title), artist=VALUES(artist), community=VALUES(community), work_type=VALUES(work_type), summary=VALUES(summary), source_title=VALUES(source_title), rights_status=VALUES(rights_status), sensitivity=VALUES(sensitivity), source_authority=VALUES(source_authority), youtube_official_status=VALUES(youtube_official_status), romanized_terms=VALUES(romanized_terms), body=VALUES(body), facets_json=VALUES(facets_json), claim_ids_json=VALUES(claim_ids_json), source_ids_json=VALUES(source_ids_json), review_status=VALUES(review_status), public_visible=VALUES(public_visible), doc_hash=VALUES(doc_hash);"
        )
    out = root / args.out
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"wrote {out} ({len(data.get('documents', []))} docs)")


if __name__ == "__main__":
    main()
