#!/usr/bin/env python3
import json, sys, collections
from pathlib import Path

path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('data/web/puyuma_vocabulary_audio_entries.json')
rows = json.loads(path.read_text(encoding='utf-8')) if path.exists() else []
count = len(rows)
dialects = collections.Counter(str(r.get('dialect_code') or r.get('dialect') or 'unknown') for r in rows)
audio = sum(1 for r in rows if r.get('audio_url') or r.get('source_audio_url'))
phon = sum(1 for r in rows if r.get('phon') or r.get('source_phon'))
report = {
  'version':'v25',
  'entry_count':count,
  'dialect_distribution':dict(dialects),
  'audio_coverage_percent': round(audio / count * 100, 2) if count else 0,
  'phon_coverage_percent': round(phon / count * 100, 2) if count else 0,
  'public_release_recommendation':'candidate_only' if count >= 1000 else 'do_not_release_full_corpus_yet'
}
print(json.dumps(report, ensure_ascii=False, indent=2))
