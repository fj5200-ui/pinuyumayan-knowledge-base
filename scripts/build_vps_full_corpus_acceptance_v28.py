#!/usr/bin/env python3
import argparse, json, hashlib
from pathlib import Path

DIALECT_KEYS = ['Nanwang_Puyuma','Zhiben_Puyuma','Xiqun_Puyuma','Jianhe_Puyuma']

def load_entries(path: Path):
    data = json.loads(path.read_text(encoding='utf-8'))
    if isinstance(data, list):
        return data
    return data.get('items') or data.get('entries') or []

def dialect_of(row):
    return row.get('dialect_name') or row.get('dialect') or row.get('dialectCode') or row.get('dialect_code') or 'unknown'

def has_audio(row):
    return bool(row.get('source_audio_url') or row.get('audio_url') or row.get('audioUrl') or row.get('audio'))

def has_phon(row):
    return bool(row.get('source_phon') or row.get('phon') or row.get('PHON') or row.get('ipa'))

def fingerprint(row):
    payload = '|'.join(str(row.get(k,'')) for k in ['form','FORM','text','zh_tw','zh','translation_zh','source_audio_url','audio_url'])
    return hashlib.sha256(payload.encode('utf-8')).hexdigest()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--input', required=True)
    ap.add_argument('--min-entries', type=int, default=1000)
    ap.add_argument('--out', required=True)
    args = ap.parse_args()
    entries = load_entries(Path(args.input))
    dialects = {}
    seen, duplicates = set(), 0
    forbidden_hits = 0
    for row in entries:
        d = dialect_of(row)
        dialects[d] = dialects.get(d, 0) + 1
        fp = fingerprint(row)
        if fp in seen:
            duplicates += 1
        seen.add(fp)
        text = json.dumps(row, ensure_ascii=False)
        if any(term in text for term in ['卑南文化遺址','卑南遺址','Beinan Site','Peinan Site','Peinan Archaeological Site']):
            forbidden_hits += 1
    audio_count = sum(1 for r in entries if has_audio(r))
    phon_count = sum(1 for r in entries if has_phon(r))
    license_blockers = sum(1 for r in entries if str(r.get('license_status','')).lower() in {'blocked','unknown_blocked','not_allowed'})
    missing_dialects = [d for d in DIALECT_KEYS if d not in dialects]
    status = 'passed'
    reasons = []
    if len(entries) < args.min_entries:
        status = 'failed'; reasons.append(f'entry_count {len(entries)} is below required {args.min_entries}')
    if missing_dialects:
        status = 'failed'; reasons.append(f'missing dialects: {missing_dialects}')
    if forbidden_hits:
        status = 'failed'; reasons.append(f'forbidden relation hits: {forbidden_hits}')
    report = {
        'version': 'v28',
        'input': args.input,
        'total_entries': len(entries),
        'required_min_entries': args.min_entries,
        'dialects': dialects,
        'missing_dialects': missing_dialects,
        'audio_asset_count': audio_count,
        'audio_coverage_ratio': round(audio_count / max(len(entries), 1), 4),
        'source_phon_count': phon_count,
        'source_phon_coverage_ratio': round(phon_count / max(len(entries), 1), 4),
        'duplicate_count': duplicates,
        'license_blocker_count': license_blockers,
        'forbidden_relation_hits': forbidden_hits,
        'status': status,
        'reasons': reasons,
        'promotion_allowed': status == 'passed' and license_blockers == 0
    }
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if status != 'passed':
        raise SystemExit(1)

if __name__ == '__main__':
    main()
