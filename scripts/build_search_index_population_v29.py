#!/usr/bin/env python3
import argparse, json, os, subprocess, tempfile, hashlib
from pathlib import Path

BLOCKED = ['卑南文化遺址','卑南遺址','卑南考古遺址','卑南文化公園','Peinan Site','Beinan Site','Peinan Archaeological Site']

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--database', default=os.environ.get('DATABASE_URL',''))
    ap.add_argument('--out', default='data/search/search_population_report_v29.generated.json')
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()
    # This builder creates an SQL plan rather than requiring direct DB access from Python.
    sql = []
    sql.append('-- v29 search population plan')
    sql.append("INSERT INTO search_index_population_runs_v29 (run_key, status, started_at) VALUES (CONCAT('search-pop-v29-', DATE_FORMAT(UTC_TIMESTAMP(), '%Y%m%dT%H%i%sZ')), 'running', NOW());")
    sql.append('-- Populate from content_items')
    sql.append("INSERT IGNORE INTO search_index_documents_v27 (document_key, source_type, source_id, title, body_text, release_channel) SELECT CONCAT('content:', id), 'content_item', CAST(id AS CHAR), title, COALESCE(summary, title), 'public' FROM content_items WHERE review_status IN ('approved','published') AND visibility IN ('public','public_summary_only');")
    sql.append('-- Populate from puyuma_corpus_entries when public-approved')
    sql.append("INSERT IGNORE INTO search_index_documents_v27 (document_key, source_type, source_id, title, body_text, release_channel) SELECT CONCAT('vocab:', id), 'vocabulary', CAST(id AS CHAR), form_text, CONCAT_WS(' ', form_text, zh_tw, en, dialect_name), 'public' FROM puyuma_corpus_entries WHERE review_status IN ('approved','verified_public','approved_for_public_learning');")
    for term in BLOCKED:
        sql.append(f"DELETE FROM search_index_documents_v27 WHERE title LIKE '%{term}%' OR body_text LIKE '%{term}%';")
    sql_path = Path('data/search/search_population_v29.generated.sql')
    sql_path.parent.mkdir(parents=True, exist_ok=True)
    sql_path.write_text('\n'.join(sql)+'\n', encoding='utf-8')
    report = {
      'version': 'v29',
      'sql_file': str(sql_path),
      'database_url_present': bool(args.database),
      'dry_run': args.dry_run,
      'blocked_terms_enforced': BLOCKED,
      'status': 'sql_generated_apply_on_vps' if not args.dry_run else 'dry_run_sql_generated'
    }
    out = Path(args.out); out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if args.database and not args.dry_run:
        subprocess.run(['mysql', args.database], input=sql_path.read_text(encoding='utf-8'), text=True, check=True)

if __name__ == '__main__':
    main()
