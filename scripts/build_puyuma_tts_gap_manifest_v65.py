#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CORPUS = ROOT.parent / "artifacts" / "puyuma_full_corpus_hf_audio.json"
DEFAULT_GAPS = ROOT.parent / "artifacts" / "puyuma_audio_source_gap_report.json"
DEFAULT_OUT = ROOT / "data" / "audio" / "puyuma_tts_gap_manifest_v65.jsonl"
DEFAULT_SUMMARY = ROOT / "data" / "audio" / "puyuma_tts_gap_manifest_v65.generated.json"
DEFAULT_DOC = ROOT / "docs" / "puyuma_tts_gap_fill_v65.generated.md"


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_jsonl(rows: list[dict[str, Any]], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as fh:
        for row in rows:
            fh.write(json.dumps(row, ensure_ascii=False))
            fh.write("\n")


def build_gap_manifest(
    corpus_entries: list[dict[str, Any]],
    gap_rows: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    entry_by_id = {str(entry.get("id", "")): entry for entry in corpus_entries}
    manifest_rows: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []

    for gap in gap_rows:
        if gap.get("public_url_status") == "downloaded_from_public_url":
            continue

        entry_id = str(gap.get("id", ""))
        entry = entry_by_id.get(entry_id)
        if entry is None:
            skipped.append(
                {
                    "entry_id": entry_id,
                    "reason": "missing_from_corpus_entries",
                    "public_url": gap.get("public_url", ""),
                }
            )
            continue

        text = entry.get("text", {}) if isinstance(entry.get("text"), dict) else {}
        audio = entry.get("audio", {}) if isinstance(entry.get("audio"), dict) else {}
        source = entry.get("source", {}) if isinstance(entry.get("source"), dict) else {}
        category = entry.get("category", {}) if isinstance(entry.get("category"), dict) else {}
        tts = entry.get("tts", {}) if isinstance(entry.get("tts"), dict) else {}

        tts_text = str(tts.get("tts_text") or text.get("puyuma_form") or "").strip()
        manifest_rows.append(
            {
                "entry_id": entry_id,
                "dialect": str(gap.get("dialect", "")),
                "topic": str(gap.get("topic", "")),
                "source_category": str(category.get("source_category") or gap.get("topic") or ""),
                "website_category_key": str(category.get("website_category_key", "")),
                "text": tts_text,
                "normalized_text": tts_text,
                "zh_tw": str(text.get("zh_tw", "")),
                "existing_public_audio_url": str(audio.get("url") or gap.get("public_url") or ""),
                "expected_hf_relative_path": str(gap.get("hf_relative_path", "")),
                "source_path": str(source.get("source_path", "")),
                "source_row": source.get("source_row", gap.get("source_row")),
                "source_repository": str(source.get("repository", "")),
                "source_commit": str(source.get("commit", "")),
                "replacement_output_relpath": f"synthetic_gap_fill/{entry_id}.wav",
                "current_audio_status": str(gap.get("public_url_status", "")),
                "replacement_policy": "private_gap_fill_only_not_verified_source_audio",
                "public_release_allowed": False,
                "native_review_required": True,
                "qa_required": ["native_speaker_review", "alignment_check", "manual_audition"],
                "notes": "Derived from unresolved public FormosanBank/HF audio gaps.",
            }
        )

    manifest_rows.sort(key=lambda row: (str(row["dialect"]), str(row["topic"]), str(row["entry_id"])))
    return manifest_rows, skipped


def build_summary(
    manifest_rows: list[dict[str, Any]],
    skipped: list[dict[str, Any]],
    *,
    corpus_path: Path,
    gap_path: Path,
    out_path: Path,
) -> dict[str, Any]:
    by_dialect = Counter(str(row["dialect"]) for row in manifest_rows)
    by_topic = Counter(str(row["topic"]) for row in manifest_rows)
    return {
        "version": "v65",
        "corpus_path": str(corpus_path),
        "gap_path": str(gap_path),
        "out_path": str(out_path),
        "manifest_rows": len(manifest_rows),
        "by_dialect": dict(sorted(by_dialect.items())),
        "by_topic": dict(sorted(by_topic.items())),
        "public_release_allowed": False,
        "native_review_required": True,
        "skipped_rows": skipped,
    }


def write_doc(path: Path, summary: dict[str, Any], manifest_rows: list[dict[str, Any]], manifest_path: Path, summary_path: Path) -> None:
    lines = [
        "# Puyuma TTS Gap Fill Report v65",
        "",
        "這份 manifest 只用於私有 TTS 補音流程，不可回寫成「已驗證真人來源音檔」。",
        "",
        f"- Gap rows prepared: `{summary['manifest_rows']}`",
        f"- By dialect: `{json.dumps(summary['by_dialect'], ensure_ascii=False)}`",
        f"- By topic: `{json.dumps(summary['by_topic'], ensure_ascii=False)}`",
        "- Public release allowed: `false`",
        "- Native review required: `true`",
        "",
        "## Entries",
        "",
    ]
    for row in manifest_rows:
        lines.append(
            f"- `{row['entry_id']}` | `{row['dialect']}` | `{row['topic']}` | `{row['text']}` | `{row['zh_tw']}`"
        )
    lines.append("")
    lines.append("## Output")
    lines.append("")
    lines.append(f"- JSONL manifest: `{manifest_path.relative_to(ROOT)}`")
    lines.append(f"- Summary JSON: `{summary_path.relative_to(ROOT)}`")
    lines.append("")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    parser = argparse.ArgumentParser(description="Build a private-only TTS gap-fill manifest for unresolved Puyuma audio entries.")
    parser.add_argument("--corpus", type=Path, default=DEFAULT_CORPUS)
    parser.add_argument("--gaps", type=Path, default=DEFAULT_GAPS)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--summary", type=Path, default=DEFAULT_SUMMARY)
    parser.add_argument("--doc", type=Path, default=DEFAULT_DOC)
    args = parser.parse_args()

    corpus = load_json(args.corpus)
    corpus_entries = corpus.get("entries", []) if isinstance(corpus, dict) else []
    gap_report = load_json(args.gaps)
    gap_rows = gap_report.get("rows", []) if isinstance(gap_report, dict) else []

    manifest_rows, skipped = build_gap_manifest(corpus_entries, gap_rows)
    summary = build_summary(manifest_rows, skipped, corpus_path=args.corpus, gap_path=args.gaps, out_path=args.out)

    write_jsonl(manifest_rows, args.out)
    args.summary.parent.mkdir(parents=True, exist_ok=True)
    args.summary.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_doc(args.doc, summary, manifest_rows, args.out, args.summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
