#!/usr/bin/env python3
"""Print the recommended import order for database bootstrap."""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def main():
    jobs = json.loads((ROOT/'data/database/import_jobs_seed.json').read_text(encoding='utf-8'))['jobs']
    print('Recommended import order:')
    for i, job in enumerate(jobs, 1):
        print(f"{i}. {job['job_id']} -> {', '.join(job['target_tables'])} [{job['status']}]")
    print('\nFull corpus note: run build_full_puyuma_web_vocabulary.py --download --min-entries 1000 before treating corpus as complete.')

if __name__ == '__main__':
    main()
