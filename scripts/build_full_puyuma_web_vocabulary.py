#!/usr/bin/env python3
"""Build the full website-ready Puyuma corpus from FormosanBank/ePark sources.

This builder is intentionally conservative:
- It never fabricates missing audio, IPA, or translations.
- CSV rows are parsed when they contain an MP3 URL.
- FormosanBank XML <S> records are parsed with FORM/PHON/TRANSL/AUDIO.
- Source PHON is preserved as source IPA/phonetic transcription when present.
- Rule-based G2P/IPA remains a draft fallback, not an authoritative analysis.

Default source list: data/web/puyuma_vocabulary_full_source_manifest.json
Default output: data/web/puyuma_vocabulary_audio_entries.json
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path
from typing import Any, Iterable

from puyuma_g2p_ipa import to_ipa

ROOT = Path(__file__).resolve().parents[1]
REPO = "FormosanBank/FormosanBank"
COMMIT = "604a1074b6ea5685365defd8cfd043f3f10aaecb"

DIALECTS = {
    "38": {"dialect": "Nanwang_Puyuma", "dialect_zh": "南王卑南語", "platform_key": "puyuma", "community_label_zh": "南王"},
    "39": {"dialect": "Zhiben_Puyuma", "dialect_zh": "知本卑南語", "platform_key": "katratripulr", "community_label_zh": "知本"},
    "40": {"dialect": "Xiqun_Puyuma", "dialect_zh": "西群卑南語", "platform_key": "ulivelivek", "community_label_zh": "西群／初鹿系"},
    "41": {"dialect": "Jianhe_Puyuma", "dialect_zh": "建和卑南語", "platform_key": "kasavakan", "community_label_zh": "建和"},
}

CATEGORY_ALIASES = {
    "九階教材": "九階教材",
    "情境族語": "情境族語",
    "生活會話篇": "生活會話篇",
    "族語短文": "族語短文",
    "文化篇": "文化篇",
    "閱讀書寫篇": "閱讀書寫篇",
    "句型篇國中": "句型篇國中",
    "句型篇高中": "句型篇高中",
    "圖畫故事篇": "圖畫故事篇",
    "繪本平台": "繪本平台",
    "jiu_jie_jiao_cai_nine_level_materials": "九階教材",
    "qing_jing_zu_yu_contextual_indigenous_language": "情境族語",
    "sheng_huo_hui_hua_pian_daily_conversation": "生活會話篇",
    "zu_yu_duan_wen_indigenous_language_essays": "族語短文",
    "wen_hua_pian_cultural_section": "文化篇",
    "yue_du_shu_xie_pian_reading_writing": "閱讀書寫篇",
    "ju_xing_pian_guo_zhong_sentence_patterns_junior_high": "句型篇國中",
    "ju_xing_pian_gao_zhong_sentence_patterns_senior_high": "句型篇高中",
    "tu_hua_gu_shi_pian_picture_story": "圖畫故事篇",
    "hui_ben_ping_tai_picture_book_platform": "繪本平台",
}

WEBSITE_CATEGORY_LABELS = {
    "greeting": "問候語",
    "classroom_school": "教室與學校",
    "family_community": "家庭與部落",
    "self_introduction": "自我介紹",
    "ritual_culture": "文化與祭儀公開語句",
    "daily_conversation": "日常會話",
}

AUDIO_RE = re.compile(r"https?://[^\s\"']+?\.mp3(?:\?[^\s\"']*)?", re.I)


def safe_rel(path: str) -> Path:
    """Return a repository path as a safe relative filesystem path."""
    return Path(*[p for p in Path(path).parts if p not in ("..", "", "/")])


def quote_url(url: str) -> str:
    return urllib.parse.quote(url, safe=":/?#[]@!$&'()*+,;=%")


def download(url: str, target: Path, timeout: int = 60) -> tuple[bool, str]:
    target.parent.mkdir(parents=True, exist_ok=True)
    try:
        with urllib.request.urlopen(quote_url(url), timeout=timeout) as r:
            status = getattr(r, "status", 200)
            if status >= 400:
                return False, f"HTTP {status}"
            data = r.read()
            if not data:
                return False, "empty response"
            target.write_bytes(data)
            return True, "ok"
    except urllib.error.HTTPError as exc:
        return False, f"HTTP {exc.code}"
    except Exception as exc:  # pragma: no cover - network dependent
        return False, str(exc)


def infer_dialect(path: Path, root: ET.Element | None = None) -> str | None:
    text = str(path)
    for code in DIALECTS:
        if re.search(rf"(^|/|\\){code}(\D|$)", text):
            return code
    for code, info in DIALECTS.items():
        if info["dialect"] in text:
            return code
    for code, label in [("38", "南王"), ("39", "知本"), ("40", "西群"), ("41", "建和")]:
        if label in text:
            return code
    if root is not None:
        joined = " ".join(str(root.get(k, "")) for k in ["source", "dialect", "id"])
        for code, info in DIALECTS.items():
            if info["dialect"].replace("_Puyuma", "") in joined or info["dialect"] in joined:
                return code
        if "Nanwang" in joined or "南王" in joined:
            return "38"
        if "Zhiben" in joined or "知本" in joined:
            return "39"
        if "Xiqun" in joined or "西群" in joined:
            return "40"
        if "Jianhe" in joined or "建和" in joined:
            return "41"
    return None


def infer_category(path: Path) -> str:
    text = str(path)
    for k, v in CATEGORY_ALIASES.items():
        if k in text:
            return v
    return "未分類"


def website_category_key(cat: str, zh: str, form: str) -> str:
    text = f"{cat} {zh} {form}".lower()
    if any(k in text for k in ["你好", "大家好", "早安", "hello", "inabayan", "semavalran", "inavayan", "'inavayan"]):
        return "greeting"
    if any(k in text for k in ["老師", "上課", "起立", "敬禮", "學校", "族語", "課本", "筆", "橡皮擦", "教室"]):
        return "classroom_school"
    if any(k in text for k in ["爸爸", "媽媽", "母親", "父親", "哥哥", "家庭", "家", "部落", "族群", "朋友"]):
        return "family_community"
    if any(k in text for k in ["名字", "我叫", "認識", "哪裡", "回來"]):
        return "self_introduction"
    if any(k in text for k in ["祭", "文化", "歌", "舞", "小米", "年祭", "祖"]):
        return "ritual_culture"
    return "daily_conversation"


def normalize_audio_url(audio: str) -> str:
    audio = audio.strip()
    if audio.startswith("http"):
        return audio
    return audio


def parse_csv(path: Path) -> list[dict[str, Any]]:
    code = infer_dialect(path)
    if not code:
        return []
    cat = infer_category(path)
    out: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        for row_no, row in enumerate(csv.reader(f), 1):
            cells = [c.strip() for c in row if c is not None]
            if len(cells) < 2:
                continue
            audio = ""
            for c in reversed(cells):
                match = AUDIO_RE.search(c)
                if match:
                    audio = match.group(0)
                    break
            if not audio:
                continue
            non_audio = [c for c in cells if not AUDIO_RE.search(c)]
            if len(non_audio) >= 3:
                form, maybe_en, maybe_zh = non_audio[0], non_audio[1], non_audio[2]
                # ePark CSV variants: some have [form, zh, audio], some [form, en, zh, audio].
                if re.search(r"[\u4e00-\u9fff]", maybe_en) and not re.search(r"[\u4e00-\u9fff]", maybe_zh):
                    zh, en = maybe_en, maybe_zh
                else:
                    en, zh = maybe_en, maybe_zh
            elif len(non_audio) == 2:
                form, zh = non_audio[0], non_audio[1]
                en = ""
            else:
                continue
            if form and zh:
                out.append({
                    "dialect_code": code,
                    "category": cat,
                    "source_path": str(path),
                    "source_row": row_no,
                    "source_record_id": f"row-{row_no}",
                    "form_original": form,
                    "form_standard": form,
                    "source_phon_original": "",
                    "source_phon_standard": "",
                    "en": en,
                    "zh": zh,
                    "audio_url": normalize_audio_url(audio),
                    "audio_file": "",
                    "audio_start": None,
                    "audio_end": None,
                    "source_format": "csv",
                })
    return out


def direct_text(el: ET.Element | None) -> str:
    if el is None or el.text is None:
        return ""
    return el.text.strip()


def pick_by_kind(parent: ET.Element, tag: str, preferred: str = "standard") -> str:
    candidates = [el for el in parent.findall(tag)]
    for kind in [preferred, "original", ""]:
        for el in candidates:
            if (el.get("kindOf") or "") == kind:
                txt = direct_text(el)
                if txt:
                    return txt
    for el in candidates:
        txt = direct_text(el)
        if txt:
            return txt
    return ""


def pick_translations(parent: ET.Element) -> tuple[str, str]:
    zh = ""
    en = ""
    for el in parent.findall("TRANSL"):
        lang = (el.get("{http://www.w3.org/XML/1998/namespace}lang") or el.get("lang") or "").lower()
        txt = direct_text(el)
        if not txt:
            continue
        if lang in {"zho", "zh", "zh-tw", "cmn"} and not zh:
            zh = txt
        elif lang in {"eng", "en"} and not en:
            en = txt
    if not zh:
        for el in parent.findall("TRANSL"):
            txt = direct_text(el)
            if re.search(r"[\u4e00-\u9fff]", txt):
                zh = txt
                break
    if not en:
        for el in parent.findall("TRANSL"):
            txt = direct_text(el)
            if txt and txt != zh and re.search(r"[A-Za-z]", txt):
                en = txt
                break
    return zh, en


def parse_xml(path: Path) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    try:
        root = ET.parse(path).getroot()
    except ET.ParseError:
        return []
    code = infer_dialect(path, root)
    if not code:
        return []
    cat = infer_category(path)
    sentence_nodes = [el for el in root.iter() if el.tag.split("}")[-1] == "S"]
    for idx, node in enumerate(sentence_nodes, 1):
        audio_el = node.find("AUDIO")
        if audio_el is None:
            audio_el = node.find(".//AUDIO")
        if audio_el is None:
            continue
        audio = audio_el.get("url") or audio_el.get("href") or ""
        if not audio:
            raw = direct_text(audio_el) or audio_el.get("file", "")
            match = AUDIO_RE.search(raw)
            audio = match.group(0) if match else raw
        audio = normalize_audio_url(audio)
        if not audio or not (audio.startswith("http") or audio.endswith(".mp3") or audio.endswith(".wav")):
            continue
        form_standard = pick_by_kind(node, "FORM", "standard")
        form_original = pick_by_kind(node, "FORM", "original") or form_standard
        phon_standard = pick_by_kind(node, "PHON", "standard")
        phon_original = pick_by_kind(node, "PHON", "original") or phon_standard
        zh, en = pick_translations(node)
        if not form_standard:
            continue
        out.append({
            "dialect_code": code,
            "category": cat,
            "source_path": str(path),
            "source_row": idx,
            "source_record_id": node.get("id") or f"s-{idx}",
            "form_original": form_original,
            "form_standard": form_standard,
            "source_phon_original": phon_original,
            "source_phon_standard": phon_standard,
            "en": en,
            "zh": zh,
            "audio_url": audio,
            "audio_file": audio_el.get("file", ""),
            "audio_start": audio_el.get("start"),
            "audio_end": audio_el.get("end"),
            "source_format": "xml",
        })
    return out


def stable_id(row: dict[str, Any]) -> str:
    h = hashlib.sha1(
        f"{row['dialect_code']}|{row['source_path']}|{row['source_record_id']}|{row['form_standard']}|{row['audio_url']}".encode("utf-8")
    ).hexdigest()[:14]
    return f"puyuma-audio-{h}"


def enrich(row: dict[str, Any]) -> dict[str, Any]:
    d = DIALECTS[row["dialect_code"]]
    draft = to_ipa(row["form_standard"])
    source_phon = row.get("source_phon_standard") or row.get("source_phon_original") or ""
    ipa_value = source_phon or draft["ipa"]
    ipa_status = "source_phon_from_formosanbank" if source_phon else "rule_based_draft_requires_linguist_review"
    cat = website_category_key(row["category"], row.get("zh", ""), row["form_standard"])
    eid = stable_id(row)
    return {
        "id": eid,
        "type": "sentence_audio",
        "language": {
            "ethnic_group_zh": "卑南族",
            "ethnic_group_romanized": "Pinuyumayan",
            "language_zh": "卑南語",
            "language_en": "Puyuma language",
            "dialect_code": row["dialect_code"],
            "dialect_name": d["dialect"],
            "dialect_zh": d["dialect_zh"],
            "platform_key": d["platform_key"],
            "community_label_zh": d["community_label_zh"],
        },
        "category": {
            "source_category": row["category"],
            "website_category_key": cat,
            "website_category_label_zh": WEBSITE_CATEGORY_LABELS[cat],
        },
        "text": {
            "puyuma_form": row["form_standard"],
            "puyuma_form_original": row.get("form_original") or row["form_standard"],
            "zh_tw": row.get("zh", ""),
            "en": row.get("en", ""),
        },
        "audio": {
            "url": row["audio_url"],
            "source_file": row.get("audio_file", ""),
            "start": row.get("audio_start"),
            "end": row.get("audio_end"),
            "mime_type": "audio/mpeg" if row["audio_url"].endswith(".mp3") else "audio/wav",
            "storage_mode": "remote_url",
            "provider": "Klokah/ePark public audio URL indexed through FormosanBank",
            "local_file_included": False,
            "local_mirror": {
                "supported_by_script": True,
                "default_path": f"external/puyuma_audio_mirror/{eid}.mp3",
                "included_in_zip": False,
            },
            "website_playback": {
                "html_audio_controls": True,
                "preload": "none",
                "cross_origin": "anonymous",
                "fallback_text_zh": "音檔暫時無法播放，請稍後再試。",
            },
        },
        "g2p": {
            "status": "rule_based_draft_requires_linguist_review",
            "engine": "scripts/puyuma_g2p_ipa.py",
            "orthography": "FormosanBank/ePark source orthography",
            "phoneme_sequence": draft["phoneme_sequence"],
            "notes_zh": "G2P 為網站輔助欄位；若 source_phon 存在，IPA 顯示優先使用來源 PHON。",
        },
        "ipa": {
            "status": ipa_status,
            "value": ipa_value,
            "source_phon": source_phon,
            "draft_value": draft["ipa"],
            "format": "source_phon_or_space_separated_ipa_symbols",
            "notes_zh": "FormosanBank XML 若已有 PHON，優先保存；否則使用規則式草稿，需專家審核。",
        },
        "tts": {
            "tts_text": row["form_standard"],
            "status": "metadata_only_not_generated",
            "enabled_for_public_ui": False,
            "allowed_use": ["accessibility_fallback_after_review", "admin_preview_only"],
            "blocked_use": ["voice_cloning", "synthetic_elder_voice", "ritual_voice_generation", "public_auto_tts_without_review"],
            "recommended_pipeline": "Use verified human audio first; TTS only as fallback after language and cultural review.",
            "review_required": True,
        },
        "source": {
            "source_id": "formosanbank_epark",
            "repository": REPO,
            "commit": COMMIT,
            "source_path": row["source_path"],
            "source_row": row["source_row"],
            "source_record_id": row.get("source_record_id"),
            "source_format": row["source_format"],
            "verification_status": "verified_public_source",
            "license_review_required_before_commercial_use": True,
        },
        "website": {
            "status": "ready_for_public_preview",
            "route": f"/language/puyuma/audio/{eid}",
            "filters": {
                "dialect": d["dialect"],
                "dialect_code": row["dialect_code"],
                "category": cat,
                "has_audio": True,
                "has_ipa": bool(ipa_value),
                "has_g2p": True,
                "has_source_phon": bool(source_phon),
            },
        },
        "sensitivity": "public",
        "review_status": "approved_for_public_learning",
    }


def load_manifest(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if "csv_sources" not in data or "xml_sources" not in data:
        raise ValueError("manifest must contain csv_sources and xml_sources")
    return data


def download_sources(manifest: dict[str, Any], source_dir: Path) -> dict[str, Any]:
    results = []
    for item in manifest.get("csv_sources", []) + manifest.get("xml_sources", []):
        target = source_dir / safe_rel(item["path"])
        ok, msg = download(item["raw_url"], target)
        results.append({"path": item["path"], "target": str(target), "ok": ok, "message": msg})
        print(("OK  " if ok else "FAIL") + f" {item['path']} {msg}")
    return {
        "attempted": len(results),
        "downloaded": sum(1 for r in results if r["ok"]),
        "failed": sum(1 for r in results if not r["ok"]),
        "results": results,
    }


def parse_source_dir(source_dir: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for p in sorted(source_dir.rglob("*")):
        if not p.is_file():
            continue
        if p.suffix.lower() == ".csv":
            rows.extend(parse_csv(p))
        elif p.suffix.lower() == ".xml":
            rows.extend(parse_xml(p))
    return rows


def write_summary(entries: list[dict[str, Any]], rows: list[dict[str, Any]], out_path: Path, download_report: dict[str, Any] | None) -> Path:
    summary_path = out_path.with_name("puyuma_full_corpus_build_summary.generated.json")
    dialect_counts = Counter(e["language"]["dialect_code"] for e in entries)
    category_counts = Counter(e["category"]["website_category_key"] for e in entries)
    format_counts = Counter(e["source"]["source_format"] for e in entries)
    source_phon_count = sum(1 for e in entries if e["ipa"].get("source_phon"))
    summary = {
        "version": "2026-06-11-full-corpus-builder-v2",
        "output_file": str(out_path.relative_to(ROOT)) if out_path.is_relative_to(ROOT) else str(out_path),
        "raw_rows_with_audio": len(rows),
        "deduped_entry_count": len(entries),
        "dialect_counts": dict(sorted(dialect_counts.items())),
        "category_counts": dict(sorted(category_counts.items())),
        "source_format_counts": dict(sorted(format_counts.items())),
        "entries_with_source_phon": source_phon_count,
        "entries_with_rule_based_ipa_only": len(entries) - source_phon_count,
        "audio_url_count": sum(1 for e in entries if e.get("audio", {}).get("url")),
        "download_report": download_report,
        "notes_zh": [
            "deduped_entry_count 才是本次實際產生筆數，不得用來源檔數直接推估。",
            "IPA 優先使用 FormosanBank XML PHON；CSV 沒有 PHON 時使用規則式草稿。",
            "TTS 只建立 metadata，不產生聲音，也不公開自動播放。",
        ],
    }
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    return summary_path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, default=ROOT / "data/web/puyuma_vocabulary_full_source_manifest.json")
    parser.add_argument("--source-dir", type=Path, default=ROOT / "external/formosanbank_puyuma")
    parser.add_argument("--download", action="store_true", help="Download raw CSV/XML sources from GitHub before building.")
    parser.add_argument("--out", type=Path, default=ROOT / "data/web/puyuma_vocabulary_audio_entries.json")
    parser.add_argument("--min-entries", type=int, default=1, help="Fail if generated entries are below this count.")
    args = parser.parse_args()

    manifest = load_manifest(args.manifest)
    download_report = download_sources(manifest, args.source_dir) if args.download else None
    rows = parse_source_dir(args.source_dir)

    seen: set[tuple[str, str, str]] = set()
    entries: list[dict[str, Any]] = []
    for r in rows:
        key = (r["dialect_code"], r["form_standard"], r["audio_url"])
        if key in seen:
            continue
        seen.add(key)
        entries.append(enrich(r))

    entries.sort(key=lambda e: (
        e["language"]["dialect_code"],
        e["source"]["source_format"],
        e["category"]["source_category"],
        str(e["source"]["source_path"]),
        int(e["source"].get("source_row") or 0),
    ))

    args.out.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "version": "generated-full-formosanbank-v2",
        "entry_count": len(entries),
        "entries": entries,
    }
    args.out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    summary_path = write_summary(entries, rows, args.out, download_report)
    print(f"wrote {len(entries)} entries to {args.out}")
    print(f"wrote build summary to {summary_path}")
    if len(entries) < args.min_entries:
        print(f"entry count {len(entries)} below --min-entries {args.min_entries}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
