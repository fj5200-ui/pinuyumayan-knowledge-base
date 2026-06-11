#!/usr/bin/env python3
from __future__ import annotations
import json, sys
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
REQUIRED = [
    'data/web/pinuyumayan_source_citation_map.json',
    'data/web/pinuyumayan_faq.json',
    'data/web/pinuyumayan_learning_paths.json',
    'data/web/pinuyumayan_timeline_events.json',
    'data/web/pinuyumayan_content_blueprints.json',
    'data/web/pinuyumayan_seo_metadata.json',
    'data/web/pinuyumayan_topic_pages.json',
    'data/web/pinuyumayan_sensitive_content_rules.json',
    'data/web/pinuyumayan_knowledge_api_contract.json',
    'data/web/pinuyumayan_public_figures_seed.json',
    'data/web/pinuyumayan_search_index.json',
]

def load(rel):
    with open(BASE/rel, encoding='utf-8') as f:
        return json.load(f)

def err(msg):
    print('ERROR:', msg, file=sys.stderr)
    raise SystemExit(1)

def main():
    for rel in REQUIRED:
        if not (BASE/rel).exists():
            err(f'missing {rel}')
    facts = load('data/verified_pinuyumayan_facts.json').get('facts', [])
    fact_ids = {f['id'] for f in facts}
    if len(facts) < 100:
        err(f'expected at least 100 verified facts, got {len(facts)}')
    for f in facts:
        if not f.get('source_ids'):
            err(f'fact missing source_ids: {f.get("id")}')
        if f.get('sensitivity') not in {'low','medium','high','public'}:
            err(f'bad sensitivity in fact {f.get("id")}: {f.get("sensitivity")}')
    faq = load('data/web/pinuyumayan_faq.json').get('items', [])
    if len(faq) < 30:
        err(f'expected at least 30 FAQ items, got {len(faq)}')
    for item in faq:
        if not item.get('source_ids'):
            err(f'FAQ missing source_ids: {item.get("id")}')
        if 'Puyuma' in item.get('answer_zh','') and 'Pinuyumayan' not in item.get('answer_zh','') and item.get('category') == '正名':
            err(f'name FAQ may be ambiguous: {item.get("id")}')
    topics = load('data/web/pinuyumayan_topic_pages.json').get('topic_pages', [])
    if len(topics) < 10:
        err('topic pages too few')
    for t in topics:
        for fid in t.get('fact_ids', []):
            if fid not in fact_ids:
                err(f'topic references missing fact {fid}: {t.get("id")}')
        if not t.get('source_ids'):
            err(f'topic missing source_ids: {t.get("id")}')
    timeline = load('data/web/pinuyumayan_timeline_events.json').get('events', [])
    if len(timeline) < 8:
        err('timeline events too few')
    sensitive = load('data/web/pinuyumayan_sensitive_content_rules.json')
    if len(sensitive.get('restricted_topics', [])) < 5:
        err('sensitive rules too few')
    search = load('data/web/pinuyumayan_search_index.json')
    if search.get('document_count', 0) != len(search.get('documents', [])):
        err('search index count mismatch')
    if search.get('document_count', 0) < 150:
        err(f'search index too small: {search.get("document_count")}')
    print(f'web knowledge OK: {len(facts)} facts, {len(faq)} FAQ, {len(topics)} topic pages, {search.get("document_count")} search docs')

if __name__ == '__main__':
    main()
