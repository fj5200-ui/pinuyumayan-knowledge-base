#!/usr/bin/env python3
from __future__ import annotations
import argparse
import json
from pathlib import Path
from typing import Any


def q(value: Any) -> str:
    return str(value if value is not None else "").replace("'", "''")


def json_sql(value: Any) -> str:
    return q(json.dumps(value, ensure_ascii=False))


def nullable(value: Any) -> str:
    return "NULL" if value is None else f"'{q(value)}'"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="data/audio/speech_asset_authorization_v44.json")
    parser.add_argument("--out", default="database/seeds/040_speech_asset_authorization_v44.generated.sql")
    args = parser.parse_args()
    root = Path.cwd()
    data = json.loads((root / args.input).read_text(encoding="utf-8"))
    lines = ["-- generated v44 speech asset authorization review seed"]
    for item in data.get("items", []):
        lines.append(
            "INSERT INTO speech_asset_authorization_v44 "
            "(asset_id, entry_id, source_audio_url, source_id, source_path, source_license, license_evidence_url, commercial_use_allowed, "
            "speaker_id_or_anonymous_code, speaker_consent_status, dialect_code, dialect_zh, transcript_text, phon, ipa, alignment_status, "
            "alignment_score, review_status, allowed_for_train_export, allowed_for_dev_export, allowed_for_test_export, blocked_reasons_json, required_next_actions_json, review_json) VALUES "
            f"('{q(item.get('asset_id'))}',{nullable(item.get('entry_id'))},{nullable(item.get('source_audio_url'))},{nullable(item.get('source_id'))},{nullable(item.get('source_path'))},'{q(item.get('source_license'))}',{nullable(item.get('license_evidence_url'))},{1 if item.get('commercial_use_allowed') else 0},"
            f"{nullable(item.get('speaker_id_or_anonymous_code'))},'{q(item.get('speaker_consent_status'))}',{nullable(item.get('dialect_code'))},{nullable(item.get('dialect_zh'))},{nullable(item.get('transcript_text'))},{nullable(item.get('phon'))},{nullable(item.get('ipa'))},'{q(item.get('alignment_status'))}',"
            f"{'NULL' if item.get('alignment_score') is None else item.get('alignment_score')},'{q(item.get('review_status'))}',{1 if item.get('allowed_for_train_export') else 0},{1 if item.get('allowed_for_dev_export') else 0},{1 if item.get('allowed_for_test_export') else 0},CAST('{json_sql(item.get('blocked_reasons', []))}' AS JSON),CAST('{json_sql(item.get('required_next_actions', []))}' AS JSON),CAST('{json_sql(item)}' AS JSON)) "
            "ON DUPLICATE KEY UPDATE source_audio_url=VALUES(source_audio_url), source_license=VALUES(source_license), speaker_consent_status=VALUES(speaker_consent_status), alignment_status=VALUES(alignment_status), review_status=VALUES(review_status), blocked_reasons_json=VALUES(blocked_reasons_json), required_next_actions_json=VALUES(required_next_actions_json), review_json=VALUES(review_json);"
        )
    out = root / args.out
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"wrote {out} ({len(data.get('items', []))} assets)")


if __name__ == "__main__":
    main()
