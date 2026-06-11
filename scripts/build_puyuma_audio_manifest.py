#!/usr/bin/env python3
"""Build a Puyuma audio manifest from FormosanBank/ePark CSV and XML files."""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, Iterable, List, Optional

ROOT = Path(__file__).resolve().parents[1]
DIALECTS = {
    "38": {"dialect": "Nanwang_Puyuma", "dialect_zh": "南王卑南語", "community_key": "puyuma"},
    "39": {"dialect": "Zhiben_Puyuma", "dialect_zh": "知本卑南語", "community_key": "katratripulr"},
    "40": {"dialect": "Xiqun_Puyuma", "dialect_zh": "西群卑南語", "community_key": "ulivelivek"},
    "41": {"dialect": "Jianhe_Puyuma", "dialect_zh": "建和卑南語", "community_key": "kasavakan"},
}
CATEGORY_ALIASES = {
    "九階教材": "九階教材",
    "情境族語": "情境族語",
    "生活會話篇": "生活會話篇",
    "族語短文": "族語短文",
    "文化篇": "文化篇",
    "閱讀書寫篇": "閱讀書寫篇",
    "jiu_jie_jiao_cai_nine_level_materials": "九階教材",
    "qing_jing_zu_yu_contextual_indigenous_language": "情境族語",
    "sheng_huo_hui_hua_pian_daily_conversation": "生活會話篇",
    "zu_yu_duan_wen_indigenous_language_essays": "族語短文",
    "wen_hua_pian_cultural_section": "文化篇",
    "yue_du_shu_xie_pian_reading_writing": "閱讀書寫篇",
    "tu_hua_gu_shi_pian_picture_story": "圖畫故事篇",
    "hui_ben_ping_tai_picture_book_platform": "繪本平台",
}


def infer_dialect(path: Path) -> Optional[str]:
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
    return None


def infer_category(path: Path) -> str:
    text = str(path)
    for key, value in CATEGORY_ALIASES.items():
        if key in text:
            return value
    return "未分類"


def stable_id(source_path: str, row_no: int, form: str, audio_url: str) -> str:
    digest = hashlib.sha1(f"{source_path}|{row_no}|{form}|{audio_url}".encode("utf-8")).hexdigest()[:12]
    return f"puyuma-{digest}"


def normalize_csv_row(row: List[str]) -> Optional[Dict[str, str]]:
    cells = [c.strip() for c in row if c is not None]
    if not cells or len(cells) < 3:
        return None
    audio_url = ""
    for cell in reversed(cells):
        if cell.startswith("http") and (".mp3" in cell or "sound" in cell):
            audio_url = cell
            break
    if not audio_url:
        return None
    form = cells[0]
    if len(cells) >= 4:
        english = cells[1]
        chinese = cells[2]
    else:
        english = ""
        chinese = cells[1]
    return {"form": form, "english": english, "chinese": chinese, "audio_url": audio_url}


def iter_csv_entries(path: Path) -> Iterable[Dict[str, object]]:
    dialect_code = infer_dialect(path)
    if not dialect_code:
        return
    info = DIALECTS[dialect_code]
    category = infer_category(path)
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        for row_no, row in enumerate(reader, start=1):
            parsed = normalize_csv_row(row)
            if not parsed:
                continue
            yield {
                "id": stable_id(str(path), row_no, parsed["form"], parsed["audio_url"]),
                "dialect_code": dialect_code,
                "dialect": info["dialect"],
                "dialect_zh": info["dialect_zh"],
                "community_key": info["community_key"],
                "category": category,
                "form": parsed["form"],
                "english": parsed["english"],
                "chinese": parsed["chinese"],
                "audio_url": parsed["audio_url"],
                "source_path": str(path),
                "source_row": row_no,
                "license_note": "FormosanBank/ePark source; verify downstream usage terms before public redistribution.",
            }


def text_of(el: Optional[ET.Element]) -> str:
    if el is None:
        return ""
    return "".join(el.itertext()).strip()


def iter_xml_entries(path: Path) -> Iterable[Dict[str, object]]:
    dialect_code = infer_dialect(path)
    if not dialect_code:
        return
    info = DIALECTS[dialect_code]
    category = infer_category(path)
    try:
        tree = ET.parse(path)
    except ET.ParseError:
        return
    root = tree.getroot()
    # Generic extraction: pair nearest FORM/TRANSL/AUDIO descendants under sentence-like nodes.
    for idx, node in enumerate(root.iter(), start=1):
        audio = node.find(".//AUDIO")
        if audio is None:
            continue
        audio_url = audio.get("url") or audio.get("href") or audio.get("file") or text_of(audio)
        if not audio_url or not (audio_url.startswith("http") or audio_url.endswith(".mp3")):
            continue
        form = text_of(node.find(".//FORM"))
        transl = text_of(node.find(".//TRANSL"))
        if not form:
            continue
        yield {
            "id": stable_id(str(path), idx, form, audio_url),
            "dialect_code": dialect_code,
            "dialect": info["dialect"],
            "dialect_zh": info["dialect_zh"],
            "community_key": info["community_key"],
            "category": category,
            "form": form,
            "english": "",
            "chinese": transl,
            "audio_url": audio_url,
            "source_path": str(path),
            "source_row": idx,
            "license_note": "FormosanBank/ePark XML source; verify downstream usage terms before public redistribution.",
        }


def build_manifest(input_dir: Path) -> List[Dict[str, object]]:
    entries: List[Dict[str, object]] = []
    for path in sorted(input_dir.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix.lower() == ".csv":
            entries.extend(iter_csv_entries(path) or [])
        elif path.suffix.lower() == ".xml":
            entries.extend(iter_xml_entries(path) or [])
    # De-duplicate by dialect + form + audio_url.
    seen = set()
    unique = []
    for entry in entries:
        key = (entry.get("dialect_code"), entry.get("form"), entry.get("audio_url"))
        if key in seen:
            continue
        seen.add(key)
        unique.append(entry)
    return unique


def main() -> int:
    parser = argparse.ArgumentParser(description="Build Puyuma audio manifest from local FormosanBank/ePark CSV/XML files.")
    parser.add_argument("input_dir", type=Path, nargs="?", default=ROOT / "external" / "formosanbank_puyuma")
    parser.add_argument("--out", type=Path, default=ROOT / "data" / "generated" / "puyuma_audio_manifest.json")
    args = parser.parse_args()
    entries = build_manifest(args.input_dir)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps({"entries": entries}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {len(entries)} entries to {args.out}")
    return 0 if entries else 1


if __name__ == "__main__":
    raise SystemExit(main())
