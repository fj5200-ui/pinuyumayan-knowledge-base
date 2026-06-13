#!/usr/bin/env python3
"""Build metadata-only authority source candidates for v44.

The default dry-run reads adapter/query hints and writes candidate JSON/SQL seeds.
It intentionally does not fetch/download audio, video, complete lyrics or private
restricted content. Production can replace the stub fetcher with official API or
HTML metadata adapters while keeping the same candidate table contract.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
from typing import Any, Dict, List

BLOCKED_TERMS = ["卑南文化遺址", "卑南遺址", "卑南考古遺址", "卑南文化公園", "Peinan Site", "Beinan Site", "Peinan Archaeological Site"]


def q(s: str) -> str:
    return s.replace("'", "''")


def candidate_id(adapter_id: str, title: str) -> str:
    return hashlib.sha256(f"{adapter_id}|{title}".encode("utf-8")).hexdigest()[:24]


def build_candidates(contract: Dict[str, Any]) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    for adapter in contract.get("adapters", []):
        adapter_id = adapter["adapter_id"]
        for idx, hint in enumerate(adapter.get("query_hints", []), 1):
            blocked = [term for term in BLOCKED_TERMS if term in hint]
            title = f"{adapter['name']} metadata candidate: {hint}"
            rows.append({
                "candidate_id": f"auth-src-v44-{candidate_id(adapter_id, hint)}",
                "adapter_id": adapter_id,
                "source_title": title,
                "source_url": None,
                "publisher": adapter["name"],
                "query_hint": hint,
                "rights_status": "unknown_pending_review",
                "sensitivity": "metadata_only_review_required",
                "review_status": "candidate_needs_human_review" if not blocked else "blocked_forbidden_relation",
                "public_auto_release": False,
                "blocked_terms": blocked,
                "candidate_json": {
                    "metadata_only": True,
                    "never_fetch": contract.get("never_fetch", []),
                    "required_checks": ["dedupe", "source_url", "license", "rights", "human_review"],
                },
            })
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--contract", default="data/integration/authority_source_worker_v44.json")
    parser.add_argument("--out-json", default="data/integration/authority_source_candidates_v44.generated.json")
    parser.add_argument("--out-sql", default="database/seeds/040_authority_source_candidates_v44.generated.sql")
    args = parser.parse_args()
    root = Path.cwd()
    contract = json.loads((root / args.contract).read_text(encoding="utf-8"))
    candidates = build_candidates(contract)
    out_json = root / args.out_json
    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_json.write_text(json.dumps({"version": "v44", "count": len(candidates), "candidates": candidates}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "-- generated v44 authority source metadata candidates",
        "INSERT INTO authority_source_fetch_runs_v44 (adapter_id, mode, status, candidate_count, blocked_count, report_json)",
        f"VALUES ('v44_metadata_dry_run', 'metadata_candidate_only', 'dry_run_completed', {len(candidates)}, {sum(1 for c in candidates if c['blocked_terms'])}, JSON_OBJECT('generated_by','authority_source_candidate_worker_v44.py')) ;",
    ]
    for c in candidates:
        body = json.dumps(c["candidate_json"], ensure_ascii=False)
        blocked = json.dumps(c["blocked_terms"], ensure_ascii=False)
        lines.append(
            "INSERT INTO authority_source_candidates_v44 "
            "(candidate_id, adapter_id, source_url, source_title, publisher, query_hint, rights_status, sensitivity, review_status, blocked_terms_json, candidate_json) VALUES "
            f"('{q(c['candidate_id'])}','{q(c['adapter_id'])}',NULL,'{q(c['source_title'])}','{q(c['publisher'])}','{q(c['query_hint'])}','{q(c['rights_status'])}','{q(c['sensitivity'])}','{q(c['review_status'])}',CAST('{q(blocked)}' AS JSON),CAST('{q(body)}' AS JSON)) "
            "ON DUPLICATE KEY UPDATE source_title=VALUES(source_title), query_hint=VALUES(query_hint), review_status=VALUES(review_status), candidate_json=VALUES(candidate_json);"
        )
    out_sql = root / args.out_sql
    out_sql.parent.mkdir(parents=True, exist_ok=True)
    out_sql.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"ok": True, "candidates": len(candidates), "out_json": str(out_json), "out_sql": str(out_sql)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
