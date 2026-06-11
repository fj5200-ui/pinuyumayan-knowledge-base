#!/usr/bin/env python3
"""Export API test cases as a compact checklist for CI or manual QA."""
from __future__ import annotations
import json, argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--format', choices=['json','md'], default='md')
    parser.add_argument('--out', default='data/database/api_test_cases.generated.md')
    args = parser.parse_args()
    data = json.load(open(ROOT/'data/database/api_test_cases.json', encoding='utf-8'))
    out = ROOT / args.out
    if args.format == 'json':
        out.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    else:
        lines = ['# API Test Cases', '']
        for group in data['test_groups']:
            lines.append(f"## {group['group']}")
            for c in group['cases']:
                lines.append(f"- `{c['id']}` → `{c['procedure']}` expects `{c['expect']['status']}`")
            lines.append('')
        out.write_text('\n'.join(lines), encoding='utf-8')
    print(f"wrote {out}")

if __name__ == '__main__':
    main()

