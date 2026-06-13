#!/usr/bin/env python3
"""Export gated TTS/STT train/dev/test manifests for v44.

This script never downloads audio. It only writes metadata JSONL rows and keeps
unapproved assets in blocked_candidates.jsonl until license, speaker consent,
alignment and human review gates pass.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

APPROVED_REVIEW = {"approved_for_experiment", "approved_for_public_training"}
APPROVED_LICENSE = {"approved_for_training", "approved_public_domain", "approved_archive_permission"}
APPROVED_CONSENT = {"approved", "archive_permission_documented"}
APPROVED_ALIGNMENT = {"aligned_verified"}
SPLITS = ("train", "dev", "test")


def stable_bucket(asset_id: str) -> str:
    n = int(hashlib.sha256(asset_id.encode("utf-8")).hexdigest()[:8], 16) % 100
    if n < 80:
        return "train"
    if n < 90:
        return "dev"
    return "test"


def is_trainable(item: Dict[str, Any]) -> Tuple[bool, List[str]]:
    reasons: List[str] = []
    if item.get("review_status") not in APPROVED_REVIEW:
        reasons.append("review_status_not_approved")
    if item.get("source_license") not in APPROVED_LICENSE:
        reasons.append("license_not_approved")
    if item.get("speaker_consent_status") not in APPROVED_CONSENT:
        reasons.append("speaker_consent_not_approved")
    if item.get("alignment_status") not in APPROVED_ALIGNMENT:
        reasons.append("alignment_not_verified")
    if not item.get("transcript_text"):
        reasons.append("transcript_missing")
    return (not reasons, reasons)


def jsonl_write(path: Path, rows: Iterable[Dict[str, Any]]) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with path.open("w", encoding="utf-8") as fh:
        for row in rows:
            fh.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")
            count += 1
    return count


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="data/audio/speech_asset_authorization_v44.json")
    parser.add_argument("--out-dir", default="data/audio/exports/v44")
    args = parser.parse_args()

    root = Path.cwd()
    source = json.loads((root / args.input).read_text(encoding="utf-8"))
    out_dir = root / args.out_dir
    approved = {split: [] for split in SPLITS}
    blocked: List[Dict[str, Any]] = []

    for item in source.get("items", []):
        ok, reasons = is_trainable(item)
        row = {
            "asset_id": item.get("asset_id"),
            "entry_id": item.get("entry_id"),
            "source_audio_url": item.get("source_audio_url"),
            "dialect_code": item.get("dialect_code"),
            "dialect_zh": item.get("dialect_zh"),
            "transcript_text": item.get("transcript_text"),
            "zh_tw": item.get("zh_tw"),
            "phon": item.get("phon"),
            "ipa": item.get("ipa"),
            "source_license": item.get("source_license"),
            "speaker_id_or_anonymous_code": item.get("speaker_id_or_anonymous_code"),
            "speaker_consent_status": item.get("speaker_consent_status"),
            "alignment_status": item.get("alignment_status"),
            "alignment_score": item.get("alignment_score"),
            "no_audio_download": True,
        }
        if ok:
            approved[stable_bucket(str(item.get("asset_id", "")))].append(row)
        else:
            blocked.append({**row, "blocked_reasons": reasons})

    counts = {split: jsonl_write(out_dir / f"{split}.jsonl", approved[split]) for split in SPLITS}
    counts["blocked_candidates"] = jsonl_write(out_dir / "blocked_candidates.jsonl", blocked)

    model_card = {
        "version": "v44",
        "model_family": "puyuma_tts_stt_experiment",
        "public_release_allowed": False,
        "dataset_input": args.input,
        "dataset_counts": counts,
        "training_ready": sum(counts[s] for s in SPLITS),
        "blocked_candidates": counts["blocked_candidates"],
        "rights_gates": {
            "license_required": True,
            "speaker_consent_required": True,
            "alignment_required": True,
            "native_speaker_review_required": True,
        },
        "prohibited_uses": [
            "public synthetic voice release before review",
            "YouTube/audio/video download for training",
            "song, lyric or ceremonial audio training without explicit license",
        ],
        "evaluation_required_before_release": ["MOS for TTS", "WER for STT", "CER for STT", "human review"],
    }
    (out_dir / "model_card.generated.json").write_text(json.dumps(model_card, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (out_dir / "model_card.generated.md").write_text(
        "# Puyuma TTS/STT Experiment Model Card v44\n\n"
        f"- Public release allowed: `{model_card['public_release_allowed']}`\n"
        f"- Training-ready rows: `{model_card['training_ready']}`\n"
        f"- Blocked candidates: `{model_card['blocked_candidates']}`\n"
        "- Audio handling: metadata-only; no audio download.\n"
        "- Required gates: license, speaker consent, alignment, native speaker review, MOS/WER/CER.\n",
        encoding="utf-8",
    )
    print(json.dumps({"ok": True, "out_dir": str(out_dir), "counts": counts}, ensure_ascii=False))


if __name__ == "__main__":
    main()
