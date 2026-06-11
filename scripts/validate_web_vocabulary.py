#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, pathlib, re, sys
URL_RE = re.compile(r'^https://.*\.mp3($|\?)', re.I)

def fail(msg: str) -> None:
    print(f'web vocabulary validation failed: {msg}', file=sys.stderr)
    raise SystemExit(1)

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('path', nargs='?', default='data/web/puyuma_vocabulary_audio_entries.json')
    args = ap.parse_args()
    data = json.loads(pathlib.Path(args.path).read_text(encoding='utf-8'))
    entries = data.get('entries', [])
    if not entries: fail('entries is empty')
    seen = set()
    dialects = set()
    cats = set()
    for e in entries:
        if e['id'] in seen: fail(f'duplicate id {e["id"]}')
        seen.add(e['id'])
        if e.get('type') != 'sentence_audio': fail(f'{e["id"]}: type must be sentence_audio')
        if not e.get('text', {}).get('puyuma_form'): fail(f'{e["id"]}: missing puyuma_form')
        if not e.get('text', {}).get('zh_tw'): fail(f'{e["id"]}: missing zh_tw')
        audio = e.get('audio', {})
        if not URL_RE.match(audio.get('url', '')): fail(f'{e["id"]}: audio url must be https mp3')
        if audio.get('local_file_included') is not False: fail(f'{e["id"]}: local_file_included must be false')
        source = e.get('source', {})
        if source.get('source_id') != 'formosanbank_epark': fail(f'{e["id"]}: source_id mismatch')
        if source.get('verification_status') != 'verified_public_source': fail(f'{e["id"]}: source not verified')
        if e.get('sensitivity') != 'public': fail(f'{e["id"]}: audio learning entries must be public')
        dialects.add(e['language']['dialect_name'])
        cats.add(e['category']['website_category_key'])
    print(f'web vocabulary OK: {len(entries)} entries, {len(dialects)} dialects, {len(cats)} categories')

if __name__ == '__main__': main()
