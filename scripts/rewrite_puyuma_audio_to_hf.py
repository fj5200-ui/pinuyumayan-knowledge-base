#!/usr/bin/env python3
"""Rewrite Puyuma ePark audio URLs to Hugging Face-hosted source files.

This resolves the website corpus audio away from brittle public playback URLs
and onto the FormosanBank Hugging Face dataset mirrors that store the real
audio assets per topic/language/dialect.
"""
from __future__ import annotations

import argparse
import json
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]

HF_DATASET_BY_TOPIC = {
    "學習詞彙": "FormosanBank/ePark_xue_xi_ci_biao_learning_vocabulary",
    "九階教材": "FormosanBank/ePark_jiu_jie_jiao_cai_nine_level_materials",
    "情境族語": "FormosanBank/ePark_qing_jing_zu_yu_contextual_indigenous_language",
    "生活會話篇": "FormosanBank/ePark_sheng_huo_hui_hua_pian_daily_conversation",
    "族語短文": "FormosanBank/ePark_zu_yu_duan_wen_indigenous_language_essays",
    "文化篇": "FormosanBank/ePark_wen_hua_pian_cultural_section",
    "閱讀書寫篇": "FormosanBank/ePark_yue_du_shu_xie_pian_reading_writing",
    "句型篇國中": "FormosanBank/ePark_ju_xing_pian_guo_zhong_sentence_patterns_junior_high",
    "句型篇高中": "FormosanBank/ePark_ju_xing_pian_gao_zhong_sentence_patterns_senior_high",
    "圖畫故事篇": "FormosanBank/ePark_tu_hua_gu_shi_pian_picture_story",
    "繪本平台": "FormosanBank/ePark_hui_ben_ping_tai_picture_book_platform",
}

HF_FILE_STEM_BY_TOPIC = {
    "學習詞彙": "xue_xi_ci_biao_learning_vocabulary",
    "九階教材": "jiu_jie_jiao_cai_nine_level_materials",
    "情境族語": "qing_jing_zu_yu_contextual_indigenous_language",
    "生活會話篇": "sheng_huo_hui_hua_pian_daily_conversation",
    "族語短文": "zu_yu_duan_wen_indigenous_language_essays_1",
    "文化篇": "wen_hua_pian_cultural_section_1",
    "閱讀書寫篇": "yue_du_shu_xie_pian_reading_writing",
}

HF_TOPIC_HINTS = {
    "hui_ben_ping_tai_picture_book_platform": "繪本平台",
    "jiu_jie_jiao_cai_nine_level_materials": "九階教材",
    "ju_xing_pian_gao_zhong_sentence_patterns_senior_high": "句型篇高中",
    "ju_xing_pian_guo_zhong_sentence_patterns_junior_high": "句型篇國中",
    "qing_jing_zu_yu_contextual_indigenous_language": "情境族語",
    "sheng_huo_hui_hua_pian_daily_conversation": "生活會話篇",
    "tu_hua_gu_shi_pian_picture_story": "圖畫故事篇",
    "wen_hua_pian_cultural_section": "文化篇",
    "xue_xi_ci_biao_learning_vocabulary": "學習詞彙",
    "yue_du_shu_xie_pian_reading_writing": "閱讀書寫篇",
    "zu_yu_duan_wen_indigenous_language_essays": "族語短文",
}


def quote_url(url: str) -> str:
    return urllib.parse.quote(url, safe=":/?#[]@!$&'()*+,;=%")


def load_json_url(url: str, timeout: int = 120) -> Any:
    with urllib.request.urlopen(quote_url(url), timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def load_hf_file_index(dataset_id: str) -> set[str]:
    api_url = f"https://huggingface.co/api/datasets/{dataset_id}"
    data = load_json_url(api_url)
    return {
        sibling["rfilename"]
        for sibling in data.get("siblings", [])
        if isinstance(sibling, dict) and str(sibling.get("rfilename", "")).startswith("Puyuma/")
    }


def hf_resolve_url(dataset_id: str, relative_path: str) -> str:
    return f"https://huggingface.co/datasets/{dataset_id}/resolve/main/{relative_path}?download=1"


def sorted_source_groups(entries: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for entry in entries:
        groups[str(entry["source"]["source_path"])].append(entry)
    for group_entries in groups.values():
        group_entries.sort(key=lambda entry: int(entry["source"]["source_row"]))
    return groups


def resolve_hf_topic(entry: dict[str, Any]) -> str:
    topic = str(entry["category"].get("source_category", "")).strip()
    if topic and topic not in {"未分類", "None"}:
        return topic

    search_space = " ".join(
        [
            str(entry.get("source", {}).get("source_path", "")),
            str(entry.get("audio", {}).get("source_file", "")),
        ]
    )
    for token, inferred_topic in HF_TOPIC_HINTS.items():
        if token in search_space:
            return inferred_topic
    return topic


def derive_csv_hf_file_name(
    entry: dict[str, Any],
    topic: str,
    last_sentence_row_id: int | None,
) -> tuple[str | None, int | None]:
    dialect = str(entry["language"]["dialect_name"])
    row_id = int(entry["source"]["source_row"]) - 1
    if topic == "九階教材":
        audio_name = str(entry["audio"]["url"]).rsplit("/", 1)[-1]
        if "C" in audio_name:
            if last_sentence_row_id is None:
                return None, last_sentence_row_id
            suffix = f"{last_sentence_row_id}-{row_id}"
        else:
            suffix = str(row_id)
            last_sentence_row_id = row_id
        stem = HF_FILE_STEM_BY_TOPIC[topic]
        return f"{stem}_{dialect}_{suffix}.wav", last_sentence_row_id
    stem = HF_FILE_STEM_BY_TOPIC.get(topic)
    if not stem:
        return None, last_sentence_row_id
    return f"{stem}_{dialect}_{row_id}.wav", last_sentence_row_id


def rewrite_entries(entries: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    dataset_files = {dataset_id: load_hf_file_index(dataset_id) for dataset_id in sorted(set(HF_DATASET_BY_TOPIC.values()))}
    source_groups = sorted_source_groups(entries)

    rewritten: list[dict[str, Any]] = []
    report_counts = Counter()
    topic_counts = Counter()
    unresolved: list[dict[str, Any]] = []

    for source_path, group_entries in source_groups.items():
        last_sentence_row_id: int | None = None
        for entry in group_entries:
            cloned = json.loads(json.dumps(entry, ensure_ascii=False))
            topic = resolve_hf_topic(cloned)
            dataset_id = HF_DATASET_BY_TOPIC.get(topic)
            dialect = str(cloned["language"]["dialect_name"])
            source_format = str(cloned["source"]["source_format"])
            hf_file_name = ""

            if source_format == "xml" and cloned["audio"].get("source_file"):
                hf_file_name = str(cloned["audio"]["source_file"])
            elif source_format == "csv":
                hf_file_name, last_sentence_row_id = derive_csv_hf_file_name(cloned, topic, last_sentence_row_id)
                hf_file_name = hf_file_name or ""

            hf_relative_path = f"Puyuma/{dialect}/{hf_file_name}" if hf_file_name else ""
            hf_exists = bool(dataset_id and hf_relative_path and hf_relative_path in dataset_files.get(dataset_id, set()))

            if hf_exists:
                original_url = str(cloned["audio"]["url"])
                cloned["audio"]["url"] = hf_resolve_url(dataset_id, hf_relative_path)
                cloned["audio"]["mime_type"] = "audio/wav"
                cloned["audio"]["storage_mode"] = "remote_url_hf_resolve"
                cloned["audio"]["provider"] = f"{dataset_id} Hugging Face dataset mirror"
                cloned["audio"]["resolution_method"] = "hf_dataset_source_file"
                cloned["audio"]["source_file"] = hf_file_name
                cloned["audio"]["original_public_url"] = original_url
                cloned["source"]["audio_resolution_method"] = "hf_dataset_source_file"
                cloned["source"]["audio_resolution_detail"] = hf_relative_path
                report_counts["hf_resolved_entries"] += 1
                topic_counts[topic] += 1
            else:
                report_counts["unresolved_entries"] += 1
                unresolved.append(
                    {
                        "id": cloned["id"],
                        "topic": topic,
                        "source_path": source_path,
                        "source_row": cloned["source"]["source_row"],
                        "source_format": source_format,
                        "dialect": dialect,
                        "expected_hf_dataset": dataset_id or "",
                        "expected_hf_relative_path": hf_relative_path,
                        "url": cloned["audio"]["url"],
                    }
                )
            rewritten.append(cloned)

    unique_hf_paths = {
        str(entry["source"]["audio_resolution_detail"])
        for entry in rewritten
        if str(entry["source"].get("audio_resolution_method")) == "hf_dataset_source_file"
    }
    report = {
        "entry_count": len(rewritten),
        "hf_resolved_entries": report_counts["hf_resolved_entries"],
        "unresolved_entries": report_counts["unresolved_entries"],
        "hf_resolved_unique_files": len(unique_hf_paths),
        "hf_resolved_by_topic": dict(sorted(topic_counts.items())),
        "unresolved_samples": unresolved[:200],
    }
    return rewritten, report


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--entries", type=Path, default=ROOT / "artifacts/puyuma_full_corpus.json")
    parser.add_argument("--out", type=Path, default=ROOT / "artifacts/puyuma_full_corpus_hf_audio.json")
    parser.add_argument("--report", type=Path, default=ROOT / "artifacts/puyuma_full_corpus_hf_audio_report.json")
    args = parser.parse_args()

    payload = json.loads(args.entries.read_text(encoding="utf-8"))
    entries = list(payload.get("entries", []))
    if not entries:
        raise SystemExit("no entries found")

    rewritten_entries, report = rewrite_entries(entries)
    payload["entries"] = rewritten_entries
    payload["entry_count"] = len(rewritten_entries)
    args.out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"rewritten entries: {report['hf_resolved_entries']}/{report['entry_count']} via HF")
    print(f"unique hf files: {report['hf_resolved_unique_files']}")
    print(f"unresolved entries: {report['unresolved_entries']}")
    print(f"out={args.out}")
    print(f"report={args.report}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
