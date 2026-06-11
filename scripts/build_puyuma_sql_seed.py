#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, pathlib

def q(s: object) -> str:
    return "'" + str(s).replace("'", "''") + "'"

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--input', default='data/web/puyuma_vocabulary_audio_entries.json')
    ap.add_argument('--out', default='data/web/puyuma_vocabulary_seed.sql')
    args = ap.parse_args()
    entries = json.loads(pathlib.Path(args.input).read_text(encoding='utf-8'))['entries']
    rows = []
    for e in entries:
        rows.append('  (' + ', '.join([
            q(e['id']), q(e['language']['dialect_code']), q(e['language']['dialect_name']), q(e['language']['dialect_zh']),
            q(e['category']['website_category_key']), q(e['category']['website_category_label_zh']), q(e['text']['puyuma_form']),
            q(e['text']['zh_tw']), q(e['text'].get('en','')), q(e['audio']['url']), q(e['source']['source_id']), q(e['source']['source_path']), q(e['review_status'])
        ]) + ')')
    sql = "-- Generated seed for website vocabulary audio entries\ninsert into puyuma_vocabulary_audio (id, dialect_code, dialect_name, dialect_zh, category_key, category_label_zh, puyuma_form, zh_tw, en, audio_url, source_id, source_path, review_status) values\n" + ',\n'.join(rows) + ';\n'
    pathlib.Path(args.out).write_text(sql, encoding='utf-8')
    print(f'wrote {len(entries)} rows to {args.out}')

if __name__ == '__main__': main()
