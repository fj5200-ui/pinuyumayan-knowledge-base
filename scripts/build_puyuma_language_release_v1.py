#!/usr/bin/env python3
"""Build a deterministic, checksummed Puyuma full-corpus release.

This script does not invent or download corpus rows. It transforms an already
validated full-corpus JSON artifact into gzip JSONL plus manifest.json. Optional
RSA-SHA256 signing uses the local OpenSSL CLI and a private key supplied outside
Git (for example a CI secret).
"""

from __future__ import annotations

import argparse
import base64
import gzip
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
from datetime import datetime, timezone
from typing import Any, Iterable


def load_entries(path: Path) -> list[dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(payload, list):
        rows = payload
    elif isinstance(payload, dict) and isinstance(payload.get("entries"), list):
        rows = payload["entries"]
    else:
        raise ValueError("Input must be a JSON array or an object with entries[].")
    if not rows:
        raise ValueError("Input corpus contains no entries.")
    if not all(isinstance(row, dict) for row in rows):
        raise ValueError("Every corpus entry must be an object.")
    return rows


def normalize(row: dict[str, Any], index: int, repository: str, commit: str) -> dict[str, Any]:
    language = dict(row.get("language") or {})
    text = dict(row.get("text") or {})
    category = dict(row.get("category") or {})
    audio = dict(row.get("audio") or {})
    ipa = dict(row.get("ipa") or {})
    source = dict(row.get("source") or {})

    entry_id = str(row.get("id") or row.get("entry_id") or "").strip()
    puyuma_form = str(text.get("puyuma_form") or row.get("puyuma_form") or "").strip()
    dialect_code = str(language.get("dialect_code") or row.get("dialect_code") or "").strip()
    dialect_name = str(language.get("dialect_name") or row.get("dialect_name") or "").strip()
    dialect_zh = str(language.get("dialect_zh") or row.get("dialect_zh") or "").strip()
    if not entry_id or not puyuma_form or not dialect_code or not dialect_name or not dialect_zh:
        raise ValueError(f"Entry {index + 1} lacks id, Puyuma text, or dialect identity.")

    review_status = str(row.get("review_status") or "needs_review")
    sensitivity = str(row.get("sensitivity") or "public").lower()
    if sensitivity not in {"public", "medium", "high"}:
        sensitivity = "medium"

    source.setdefault("source_id", "formosanbank_epark")
    source.setdefault("repository", repository)
    source.setdefault("commit", commit)
    source.setdefault("source_path", str(row.get("source_path") or "full-corpus"))
    source.setdefault("source_row", row.get("source_row", index + 1))
    source.setdefault("source_format", str(row.get("source_format") or "json"))

    language["language_key"] = "puyuma"
    language["dialect_code"] = dialect_code
    language["dialect_name"] = dialect_name
    language["dialect_zh"] = dialect_zh
    text["puyuma_form"] = puyuma_form
    text.setdefault("zh_tw", row.get("zh_tw"))
    text.setdefault("en", row.get("en"))

    if "website_category_key" not in category:
        category["website_category_key"] = str(row.get("category_key") or category.get("source_category") or "")
    if "website_category_label_zh" not in category:
        category["website_category_label_zh"] = str(row.get("category_label_zh") or category.get("source_category") or "")

    if "value" not in ipa:
        ipa["value"] = row.get("ipa_value")
    if "source_phon" not in ipa:
        ipa["source_phon"] = row.get("source_phon")
    if "status" not in ipa:
        ipa["status"] = str(row.get("ipa_status") or "missing")

    if "url" not in audio:
        audio["url"] = row.get("audio_url")
    audio.setdefault("mime_type", str(row.get("mime_type") or "audio/mpeg"))
    audio.setdefault("storage_mode", str(row.get("storage_mode") or "remote_url"))
    audio.setdefault("local_mirror", row.get("local_mirror_path"))
    audio.setdefault("is_synthetic", bool(row.get("is_synthetic", False)))
    audio.setdefault("playback_enabled", bool(row.get("playback_enabled", True)))
    audio.setdefault("license_review_status", str(row.get("license_review_status") or "not_reviewed"))

    visibility = str(row.get("visibility") or ("PUBLIC" if review_status == "approved_for_public_learning" and sensitivity == "public" else "MEMBER_ONLY"))
    if visibility not in {"PUBLIC", "MEMBER_ONLY", "COMMUNITY_ONLY", "ARCHIVE_ONLY"}:
        visibility = "MEMBER_ONLY"

    return {
        "id": entry_id,
        "type": str(row.get("type") or row.get("entry_type") or "sentence"),
        "language": language,
        "category": category,
        "text": text,
        "audio": audio,
        "ipa": ipa,
        "g2p": dict(row.get("g2p") or {}),
        "tts": dict(row.get("tts") or {}),
        "source": source,
        "sensitivity": sensitivity,
        "review_status": review_status,
        "visibility": visibility,
    }


def canonical_json(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def sign_manifest(manifest: dict[str, Any], private_key: Path, key_id: str) -> dict[str, str]:
    unsigned = canonical_json(manifest)
    process = subprocess.run(
        ["openssl", "dgst", "-sha256", "-sign", str(private_key)],
        input=unsigned,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if process.returncode != 0:
        raise RuntimeError(process.stderr.decode("utf-8", errors="replace"))
    return {
        "algorithm": "RSA-SHA256",
        "key_id": key_id,
        "value_base64": base64.b64encode(process.stdout).decode("ascii"),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--release-version", required=True)
    parser.add_argument("--repository", default="fj5200-ui/pinuyumayan-knowledge-base")
    parser.add_argument("--commit", default=os.environ.get("GITHUB_SHA", "unknown"))
    parser.add_argument("--private-key", type=Path)
    parser.add_argument("--key-id", default="puyuma-release")
    args = parser.parse_args()

    if not args.release_version.replace("-", "").replace("_", "").replace(".", "").isalnum():
        raise ValueError("release-version may contain only letters, digits, dot, underscore, and hyphen.")

    rows = load_entries(args.input)
    normalized = [normalize(row, index, args.repository, args.commit) for index, row in enumerate(rows)]
    ids = [row["id"] for row in normalized]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate entry IDs detected.")

    args.output_dir.mkdir(parents=True, exist_ok=True)
    corpus_name = "puyuma-corpus.jsonl.gz"
    corpus_path = args.output_dir / corpus_name
    with corpus_path.open("wb") as raw:
        with gzip.GzipFile(filename="", mode="wb", fileobj=raw, compresslevel=9, mtime=0) as gz:
            for row in normalized:
                gz.write(canonical_json(row) + b"\n")

    manifest: dict[str, Any] = {
        "schema": "pinuyumayan.language-release-manifest",
        "schema_version": 1,
        "release_id": f"puyuma-corpus-{args.release_version}",
        "release_version": args.release_version,
        "language_key": "puyuma",
        "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "source": {
            "repository": args.repository,
            "commit": args.commit,
            "license_review_required": True,
        },
        "files": [
            {
                "role": "corpus",
                "name": corpus_name,
                "url": corpus_name,
                "format": "jsonl",
                "compression": "gzip",
                "records": len(normalized),
                "bytes": corpus_path.stat().st_size,
                "sha256": sha256_file(corpus_path),
            }
        ],
    }
    if args.private_key:
        manifest["signature"] = sign_manifest(manifest, args.private_key, args.key_id)

    manifest_path = args.output_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (args.output_dir / "checksums.sha256").write_text(
        f"{sha256_file(corpus_path)}  {corpus_name}\n{sha256_file(manifest_path)}  manifest.json\n",
        encoding="utf-8",
    )
    print(json.dumps({"records": len(normalized), "manifest": str(manifest_path), "corpus": str(corpus_path)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"release build failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
