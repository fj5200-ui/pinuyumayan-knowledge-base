#!/usr/bin/env python3
"""Build v27 full-corpus acceptance report from a vocabulary audio JSON file.

This script is intentionally evidence-based. If the current input only contains
80 preview entries, the report will fail the >=1000 full-corpus gate instead of
pretending the full corpus was imported.
"""
from __future__ import annotations
import argparse, json, hashlib
from pathlib import Path
from collections import Counter

REQUIRED_DIALECTS = ["Nanwang_Puyuma", "Zhiben_Puyuma", "Xiqun_Puyuma", "Jianhe_Puyuma"]

def load_entries(path: Path):
    data=json.loads(path.read_text(encoding='utf-8'))
    if isinstance(data, dict):
        return data, list(data.get('entries', []))
    if isinstance(data, list):
        return {"version":"unknown"}, data
    raise SystemExit(f"Unsupported input shape: {type(data)}")

def deep_get(row, path):
    cur=row
    for part in path.split('.'):
        if not isinstance(cur, dict) or cur.get(part) in (None, ''):
            return None
        cur=cur.get(part)
    return cur

def val(row, *names):
    for n in names:
        if '.' in n:
            got=deep_get(row, n)
            if got not in (None, ''):
                return got
        elif isinstance(row, dict) and row.get(n) not in (None, ''):
            return row.get(n)
    return None

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--input', default='data/web/puyuma_vocabulary_audio_entries.json')
    ap.add_argument('--out', default='data/database/full_corpus_acceptance_report_v27.generated.json')
    ap.add_argument('--min-entries', type=int, default=1000)
    args=ap.parse_args()
    input_path=Path(args.input)
    meta, entries=load_entries(input_path)
    dialects=Counter(str(val(e,'dialect','dialect_name','dialectName','dialect_code','dialectCode','language.dialect_name','language.dialect_code','website.filters.dialect') or 'unknown') for e in entries)
    audio_count=sum(1 for e in entries if val(e,'audio_url','audioUrl','source_audio_url','sourceAudioUrl','audio.url'))
    phon_count=sum(1 for e in entries if val(e,'source_phon','sourcePhon','phon','PHON','text.source_phon','source.source_phon'))
    fingerprints=[]
    for e in entries:
        base=str(val(e,'form','form_text','sourceText','text.puyuma_form') or '') + '|' + str(val(e,'zh','zh_tw','translation_zh','translationZh','text.zh_tw') or '') + '|' + str(val(e,'dialect','dialect_name','dialectName','language.dialect_name') or '')
        fingerprints.append(hashlib.sha256(base.encode('utf-8')).hexdigest())
    duplicate_count=len(fingerprints)-len(set(fingerprints))
    license_blockers=sum(1 for e in entries if str(val(e,'license_status','licenseStatus') or '').lower() in {'blocked','blocked_license','unknown_blocked'})
    missing_dialects=[d for d in REQUIRED_DIALECTS if d not in dialects]
    status='passed'
    findings=[]
    if len(entries) < args.min_entries:
        status='failed'; findings.append(f"entry_count {len(entries)} is below required {args.min_entries}")
    if missing_dialects:
        status='failed'; findings.append(f"missing dialects: {', '.join(missing_dialects)}")
    if license_blockers:
        status='manual_review'; findings.append(f"license blockers detected: {license_blockers}")
    report={
        "version":"v27",
        "input":str(input_path),
        "input_version":meta.get('version'),
        "required_min_entries":args.min_entries,
        "total_entries":len(entries),
        "dialect_counts":dict(dialects),
        "required_dialects":REQUIRED_DIALECTS,
        "missing_required_dialects":missing_dialects,
        "audio_asset_count":audio_count,
        "audio_coverage_ratio":round(audio_count/len(entries),4) if entries else 0,
        "source_phon_count":phon_count,
        "source_phon_coverage_ratio":round(phon_count/len(entries),4) if entries else 0,
        "duplicate_count":duplicate_count,
        "license_blocker_count":license_blockers,
        "public_candidate_count":max(0, len(entries)-license_blockers-duplicate_count),
        "status":status,
        "findings":findings,
        "honesty_note":"If this report fails because only 80 preview entries exist, run the full corpus download/import pipeline on VPS staging before promotion."
    }
    out=Path(args.out); out.parent.mkdir(parents=True, exist_ok=True); out.write_text(json.dumps(report, ensure_ascii=False, indent=2)+"\n", encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if status == 'failed':
        raise SystemExit(2)

if __name__ == '__main__':
    main()
