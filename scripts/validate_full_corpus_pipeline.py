#!/usr/bin/env python3
from __future__ import annotations
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]

def fail(msg: str) -> None:
    print(f'full corpus pipeline validation failed: {msg}', file=sys.stderr)
    raise SystemExit(1)

def main() -> None:
    manifest_path = ROOT / 'data/web/puyuma_vocabulary_full_source_manifest.json'
    status_path = ROOT / 'data/web/puyuma_vocabulary_build_status.json'
    audit_path = ROOT / 'data/web/puyuma_corpus_scale_audit.json'
    plan_path = ROOT / 'data/web/puyuma_full_corpus_import_plan.json'
    for p in [manifest_path, status_path, audit_path, plan_path, ROOT/'scripts/build_full_puyuma_web_vocabulary.py', ROOT/'scripts/audit_puyuma_corpus_sources.py', ROOT/'scripts/validate_full_puyuma_corpus_output.py', ROOT/'data/web/puyuma_full_corpus_output_schema.json', ROOT/'data/web/puyuma_full_corpus_build_checkpoints.json', ROOT/'references/full_corpus_build_runbook.md']:
        if not p.exists(): fail(f'missing {p.relative_to(ROOT)}')
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    status = json.loads(status_path.read_text(encoding='utf-8'))
    audit = json.loads(audit_path.read_text(encoding='utf-8'))
    total = len(manifest.get('csv_sources', [])) + len(manifest.get('xml_sources', []))
    if total < 60: fail(f'source candidate count too low: {total}')
    if status.get('embedded_entry_count', 0) < 1: fail('embedded entry count missing')
    if status.get('full_corpus_actual_entry_count') is not None: fail('full corpus actual count should not be hard-coded before generation')
    if audit.get('full_source_manifest', {}).get('total_sources') != total: fail('audit total_sources mismatch')
    if '不得' not in status.get('do_not_claim_zh', ''): fail('status must warn not to claim full corpus before generation')
    if not status.get('pipeline_v2_added'): fail('pipeline v2 marker missing')
    if 'source_phon' not in status.get('source_phon_preservation',''): fail('source PHON preservation note missing')
    print(f'full corpus pipeline OK: {total} source candidates; embedded subset {status["embedded_entry_count"]} entries')

if __name__ == '__main__':
    main()
