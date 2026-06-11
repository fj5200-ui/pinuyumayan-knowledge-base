#!/usr/bin/env python3
"""Draft rule-based Puyuma G2P/IPA helper for website metadata.

This is deterministic scaffolding, not authoritative phonological analysis.
Review by a Puyuma/Pinuyumayan language expert is required before public teaching use.
"""
from __future__ import annotations
import argparse, json, re

G2P_RULES = [
    ("ng", "ŋ"), ("dr", "ɖ"), ("tr", "ʈ"), ("lr", "ɭ"), ("ts", "ts"),
    ("a", "a"), ("e", "ə"), ("i", "i"), ("u", "u"), ("o", "o"),
    ("p", "p"), ("t", "t"), ("k", "k"), ("b", "b"), ("d", "d"), ("g", "g"),
    ("m", "m"), ("n", "n"), ("r", "r"), ("l", "l"), ("v", "v"), ("w", "w"), ("y", "j"),
    ("s", "s"), ("z", "z"), ("c", "ts"), ("h", "h"), ("q", "q"), ("j", "dʒ"),
    ("’", "ʔ"), ("'", "ʔ"), (" ", " "),
]

def tokenize(text: str) -> list[str]:
    s = text.lower().replace("ē", "e").replace("á", "a").replace("à", "a").replace("í", "i").replace("ú", "u").replace("é", "e")
    s = re.sub(r'[“”".,!?;:，。！？；：「」()（）]', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    keys = [k for k, _ in G2P_RULES if len(k) > 1] + [k for k, _ in G2P_RULES if len(k) == 1]
    out: list[str] = []
    i = 0
    while i < len(s):
        for k in keys:
            if s.startswith(k, i):
                if not (k == ' ' and out and out[-1] == ' '):
                    out.append(k)
                i += len(k)
                break
        else:
            if s[i].strip():
                out.append(s[i])
            else:
                out.append(' ')
            i += 1
    return out

def to_ipa(text: str) -> dict:
    mapping = dict(G2P_RULES)
    phonemes = tokenize(text)
    ipa = [mapping.get(p, p) for p in phonemes]
    value = ' '.join([x for x in ipa if x != ' '])
    value = re.sub(r'\s+', ' ', value).strip()
    return {
        'phoneme_sequence': phonemes,
        'ipa': value,
        'status': 'rule_based_draft_requires_linguist_review',
    }

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('text')
    args = parser.parse_args()
    print(json.dumps(to_ipa(args.text), ensure_ascii=False, indent=2))
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
