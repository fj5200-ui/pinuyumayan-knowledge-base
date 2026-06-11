#!/usr/bin/env python3
import json, pathlib
root = pathlib.Path(__file__).resolve().parents[1]
packets = json.load(open(root / 'data/content/main_site_content_packets_v13.json', encoding='utf-8'))['items']
out = root / 'database/seeds/011_content_items.generated.sql'

def q(value):
    return "'" + str(value).replace("'", "''") + "'"

lines = ['-- Generated from data/content/main_site_content_packets_v13.json', 'START TRANSACTION;']
for item in packets:
    values = [
        q(item['id']), q(item['slug']), q(item['type']), q(item['title_zh']), q(item.get('summary_zh', '')),
        q(item.get('status', 'draft_verified_source')), q(item.get('visibility', 'public_summary')),
        q(item.get('release_channel', 'preview')), q(item.get('sensitivity', 'low')),
        '1' if item.get('requires_human_review', True) else '0',
        q(json.dumps(item.get('source_ids', []), ensure_ascii=False)),
        q(json.dumps(item.get('related_entity', {}), ensure_ascii=False)),
    ]
    lines.append(
        'INSERT INTO content_items (id, slug, type, title_zh, summary_zh, status, visibility, release_channel, sensitivity, requires_human_review, source_ids_json, related_entity_json) VALUES ('
        + ', '.join(values)
        + ') ON DUPLICATE KEY UPDATE title_zh=VALUES(title_zh), summary_zh=VALUES(summary_zh), status=VALUES(status), visibility=VALUES(visibility), release_channel=VALUES(release_channel), sensitivity=VALUES(sensitivity), source_ids_json=VALUES(source_ids_json), related_entity_json=VALUES(related_entity_json);'
    )
    for idx, sec in enumerate(item.get('sections', []) or []):
        section_values = [
            q(item['id']), str(idx), q(sec.get('heading', '')), q(sec.get('body_zh', '')),
            q(json.dumps(sec.get('items', []), ensure_ascii=False)),
        ]
        lines.append(
            'INSERT INTO content_item_sections (content_item_id, sort_order, heading, body_zh, items_json) VALUES ('
            + ', '.join(section_values)
            + ');'
        )
lines.append('COMMIT;')
out.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'wrote {len(packets)} content items to {out}')
