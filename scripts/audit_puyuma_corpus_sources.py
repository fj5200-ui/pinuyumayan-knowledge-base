#!/usr/bin/env python3
"""Audit FormosanBank/ePark Puyuma corpus source scale.

This script does not invent corpus counts. It reports:
1. declared source candidates from data/web/puyuma_vocabulary_full_source_manifest.json
2. actual local CSV/XML files found under --source-dir
3. actual rows/audio rows when the local files have already been downloaded

Run the full downloader first for a real full-corpus count:
    python3 scripts/build_full_puyuma_web_vocabulary.py --download
    python3 scripts/audit_puyuma_corpus_sources.py --source-dir external/formosanbank_puyuma
"""
from __future__ import annotations
import argparse
import csv
import json
import re
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
AUDIO_RE = re.compile(r'(https?://[^\s,"\']+\.mp3|[^\s,"\']+\.mp3)', re.I)
DIALECTS = {
    '38': '南王卑南語',
    '39': '知本卑南語',
    '40': '西群卑南語',
    '41': '建和卑南語',
}


def infer_dialect(text: str) -> tuple[str, str] | tuple[None, None]:
    for code, zh in DIALECTS.items():
        if f'/{code} ' in text or f'/{code}/' in text or f'_{code}' in text or f'{code} ' in Path(text).name:
            return code, zh
    mapping = {
        'Nanwang_Puyuma': ('38', '南王卑南語'),
        'Zhiben_Puyuma': ('39', '知本卑南語'),
        'Xiqun_Puyuma': ('40', '西群卑南語'),
        'Jianhe_Puyuma': ('41', '建和卑南語'),
        '南王': ('38', '南王卑南語'),
        '知本': ('39', '知本卑南語'),
        '西群': ('40', '西群卑南語'),
        '建和': ('41', '建和卑南語'),
    }
    for key, val in mapping.items():
        if key in text:
            return val
    return None, None


def count_csv(path: Path) -> dict[str, Any]:
    total = 0
    audio = 0
    nonempty = 0
    with path.open('r', encoding='utf-8-sig', newline='') as f:
        for row in csv.reader(f):
            total += 1
            if any(cell.strip() for cell in row):
                nonempty += 1
            if any(AUDIO_RE.search(cell or '') for cell in row):
                audio += 1
    return {'rows': total, 'nonempty_rows': nonempty, 'audio_rows': audio}


def count_xml(path: Path) -> dict[str, Any]:
    try:
        root = ET.parse(path).getroot()
    except ET.ParseError:
        return {'rows': 0, 'nonempty_rows': 0, 'audio_rows': 0, 'parse_error': True}
    text_nodes = 0
    audio_nodes = 0
    for el in root.iter():
        tag = str(el.tag).lower()
        if tag.endswith('text') or tag.endswith('s') or tag.endswith('w'):
            if ''.join(el.itertext()).strip():
                text_nodes += 1
        if 'audio' in tag:
            val = ' '.join([el.get(k, '') for k in ('url', 'href', 'file', 'src')]) + ' ' + ''.join(el.itertext())
            if AUDIO_RE.search(val):
                audio_nodes += 1
    return {'rows': text_nodes, 'nonempty_rows': text_nodes, 'audio_rows': audio_nodes}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--manifest', default='data/web/puyuma_vocabulary_full_source_manifest.json')
    ap.add_argument('--source-dir', default='external/formosanbank_puyuma')
    ap.add_argument('--out', default='data/web/puyuma_corpus_source_audit.generated.json')
    args = ap.parse_args()

    manifest_path = (ROOT / args.manifest).resolve() if not Path(args.manifest).is_absolute() else Path(args.manifest)
    source_dir = (ROOT / args.source_dir).resolve() if not Path(args.source_dir).is_absolute() else Path(args.source_dir)
    out_path = (ROOT / args.out).resolve() if not Path(args.out).is_absolute() else Path(args.out)

    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    declared = manifest.get('csv_sources', []) + manifest.get('xml_sources', [])

    files = [p for p in source_dir.rglob('*') if p.suffix.lower() in {'.csv', '.xml'}] if source_dir.exists() else []
    by_file = []
    totals = Counter()
    by_dialect = defaultdict(Counter)
    by_ext = Counter()

    for p in files:
        rel = str(p.relative_to(source_dir))
        code, zh = infer_dialect(str(p))
        if p.suffix.lower() == '.csv':
            stats = count_csv(p)
        else:
            stats = count_xml(p)
        item = {'path': rel, 'extension': p.suffix.lower().lstrip('.'), 'dialect_code': code, 'dialect_zh': zh, **stats}
        by_file.append(item)
        by_ext[item['extension']] += 1
        for key in ('rows', 'nonempty_rows', 'audio_rows'):
            totals[key] += int(stats.get(key, 0))
            if zh:
                by_dialect[zh][key] += int(stats.get(key, 0))

    result = {
        'version': '2026-06-11',
        'manifest': {
            'path': str(manifest_path.relative_to(ROOT)) if manifest_path.is_relative_to(ROOT) else str(manifest_path),
            'declared_csv_sources': len(manifest.get('csv_sources', [])),
            'declared_xml_sources': len(manifest.get('xml_sources', [])),
            'declared_total_sources': len(declared),
        },
        'local_source_dir': str(source_dir.relative_to(ROOT)) if source_dir.is_relative_to(ROOT) else str(source_dir),
        'local_files_found': len(files),
        'local_files_by_extension': dict(by_ext),
        'actual_counts_from_local_files': dict(totals),
        'actual_counts_by_dialect_zh': {k: dict(v) for k, v in by_dialect.items()},
        'full_corpus_count_status': 'actual' if files else 'not_generated_no_local_sources',
        'note_zh': '若 local_files_found 為 0，代表尚未執行下載；請先執行 build_full_puyuma_web_vocabulary.py --download。',
        'files': by_file,
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"declared sources: {result['manifest']['declared_total_sources']}; local files: {len(files)}; audio rows: {totals['audio_rows']}")
    print(f'wrote {out_path}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
