#!/usr/bin/env python3
from __future__ import annotations
import json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def main() -> int:
    p=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT/'data/web/puyuma_vocabulary_audio_entries.json'
    data=json.loads(p.read_text(encoding='utf-8'))
    entries=data.get('entries',[])
    assert entries, 'no entries'
    for e in entries:
        assert e.get('audio',{}).get('url','').startswith('http'), e.get('id')
        assert e.get('g2p',{}).get('phoneme_sequence'), e.get('id')
        assert e.get('ipa',{}).get('value'), e.get('id')
        assert 'tts_text' in e.get('tts',{}), e.get('id')
        assert e.get('tts',{}).get('enabled_for_public_ui') is False, e.get('id')
    print(f'tts/g2p/ipa OK: {len(entries)} entries')
    return 0
if __name__=='__main__': raise SystemExit(main())
