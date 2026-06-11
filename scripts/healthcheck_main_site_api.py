#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import urllib.request


def get_json(url: str) -> dict:
    with urllib.request.urlopen(url, timeout=10) as response:
        data = response.read().decode("utf-8")
    return json.loads(data)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://localhost:8787")
    args = parser.parse_args()
    base = args.base_url.rstrip("/")
    health = get_json(f"{base}/health")
    if not health.get("ok"):
        raise SystemExit("/health failed")
    bootstrap = get_json(f"{base}/api/public/knowledge/bootstrap")
    if "meta" not in bootstrap:
        raise SystemExit("bootstrap payload missing meta")
    print("main site API health OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
