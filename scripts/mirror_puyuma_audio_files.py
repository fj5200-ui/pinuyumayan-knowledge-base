#!/usr/bin/env python3
"""Optionally mirror audio MP3 files referenced by puyuma_vocabulary_audio_entries.json.

Use only after license/permission review. The ZIP intentionally stores URLs, not MP3 binaries.
"""
from __future__ import annotations
import argparse, json, urllib.request, urllib.parse
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def main() -> int:
    p=argparse.ArgumentParser()
    p.add_argument('--entries', type=Path, default=ROOT/'data/web/puyuma_vocabulary_audio_entries.json')
    p.add_argument('--out-dir', type=Path, default=ROOT/'external/puyuma_audio_mirror')
    p.add_argument('--limit', type=int, default=0)
    args=p.parse_args()
    data=json.loads(args.entries.read_text(encoding='utf-8'))
    args.out_dir.mkdir(parents=True, exist_ok=True)
    ok=0; fail=0
    for i,e in enumerate(data.get('entries',[]),1):
        if args.limit and i>args.limit: break
        url=e['audio']['url']; target=args.out_dir/(e['id']+'.mp3')
        try:
            with urllib.request.urlopen(urllib.parse.quote(url, safe=":/?#[]@!$&'()*+,;=%"), timeout=45) as r:
                target.write_bytes(r.read())
            ok+=1
        except Exception as exc:
            print(f'failed {e["id"]}: {exc}'); fail+=1
    print(f'mirrored={ok}, failed={fail}, out={args.out_dir}')
    return 0 if ok else 1
if __name__=='__main__': raise SystemExit(main())
