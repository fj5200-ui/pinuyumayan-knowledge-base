#!/usr/bin/env python3
from __future__ import annotations
import json, re
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]

def load(rel):
    with open(BASE/rel, encoding='utf-8') as f:
        return json.load(f)

def text_tokens(s: str):
    s = (s or '').lower()
    s = re.sub(r"[\s\u3000]+", " ", s)
    return sorted({tok for tok in re.split(r"[\s,，。！？；;:：／/、\[\]()（）]+", s) if tok})

def add_doc(docs, doc_id, kind, title, body, route, category, source_ids, sensitivity='low', extra=None):
    body = body or ''
    title = title or ''
    docs.append({
        'id': doc_id,
        'kind': kind,
        'title_zh': title,
        'body_zh': body,
        'route': route,
        'category': category,
        'source_ids': source_ids or [],
        'sensitivity': sensitivity,
        'tokens': text_tokens(title + ' ' + body + ' ' + ' '.join(source_ids or [])),
        'extra': extra or {}
    })

def main():
    docs = []
    facts = load('data/verified_pinuyumayan_facts.json').get('facts', [])
    for f in facts:
        add_doc(docs, f['id'], 'fact', f.get('category','fact'), f.get('statement_zh',''), '/knowledge/facts/' + f['id'], f.get('category',''), f.get('source_ids',[]), f.get('sensitivity','low'))

    faq = load('data/web/pinuyumayan_faq.json').get('items', [])
    for item in faq:
        add_doc(docs, item['id'], 'faq', item.get('question_zh',''), item.get('answer_zh',''), item.get('suggested_route','/knowledge/faq'), item.get('category','FAQ'), item.get('source_ids',[]), item.get('sensitivity','low'), {'tags': item.get('tags',[])})

    topics = load('data/web/pinuyumayan_topic_pages.json').get('topic_pages', [])
    for t in topics:
        add_doc(docs, t['id'], 'topic_page', t.get('title_zh',''), t.get('summary_zh',''), t.get('route','/'), 'topic', t.get('source_ids',[]), t.get('sensitivity','low'), {'components': t.get('components',[])})

    timeline = load('data/web/pinuyumayan_timeline_events.json').get('events', [])
    for ev in timeline:
        add_doc(docs, ev['id'], 'timeline', ev.get('title_zh',''), ev.get('date_label_zh','') + '｜' + ev.get('summary_zh',''), ev.get('display_route','/history'), 'timeline', ev.get('source_ids',[]), ev.get('sensitivity','low'), {'claim_type': ev.get('claim_type')})

    vocab_path = BASE/'data/web/puyuma_vocabulary_audio_entries.json'
    if vocab_path.exists():
        vocab = load('data/web/puyuma_vocabulary_audio_entries.json')
        if isinstance(vocab, dict):
            entries = vocab.get('entries', [])
        else:
            entries = vocab
        for e in entries:
            text = e.get('text', {})
            lang = e.get('language', {})
            website = e.get('website', {})
            source = e.get('source', {})
            body = '｜'.join([text.get('puyuma_form',''), text.get('zh_tw',''), text.get('en',''), lang.get('dialect_zh','')])
            add_doc(docs, e.get('id'), 'vocabulary_audio', website.get('card_title_zh') or text.get('zh_tw',''), body, website.get('route','/language/puyuma'), 'language', [source.get('source_id','formosanbank_epark')], e.get('sensitivity','public'), {'has_audio': bool(e.get('audio',{}).get('url')), 'dialect': lang.get('dialect_name')})

    out = {
        'version': '2026-06-11',
        'document_count': len(docs),
        'documents': docs
    }
    with open(BASE/'data/web/pinuyumayan_search_index.json', 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print(f'wrote search index: {len(docs)} documents')

if __name__ == '__main__':
    main()
