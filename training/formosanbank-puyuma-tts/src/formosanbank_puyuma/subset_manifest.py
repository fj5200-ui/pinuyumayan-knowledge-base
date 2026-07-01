from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path

from .pipeline import load_jsonl, write_jsonl


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Build a smaller TTS manifest subset for smoke training")
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--max-per-dialect", type=int, default=64)
    parser.add_argument("--dialect", action="append", dest="dialects", default=[])
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    rows = load_jsonl(args.input)
    wanted = set(args.dialects)
    kept: list[dict[str, object]] = []
    seen: Counter[str] = Counter()

    for row in rows:
        dialect = str(row.get("dialect", ""))
        if wanted and dialect not in wanted:
            continue
        if seen[dialect] >= args.max_per_dialect:
            continue
        kept.append(row)
        seen[dialect] += 1

    write_jsonl(kept, args.output)
    print(json.dumps({"rows": len(kept), "by_dialect": dict(sorted(seen.items())), "output": str(args.output)}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
