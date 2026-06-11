#!/usr/bin/env python3
"""Sync FormosanBank/ePark Puyuma files and optional Google Drive audio folder.

This script intentionally keeps large audio files outside the skill package. It downloads
source CSV/XML into external/formosanbank_puyuma and can optionally mirror a Google Drive
folder with gdown when the folder is public or the local environment is authenticated.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCES = ROOT / "data" / "formosanbank_sources.json"
DEFAULT_OUT = ROOT / "external" / "formosanbank_puyuma"


def load_sources(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def safe_relpath(path: str) -> Path:
    # Preserve the original repository path under the output directory.
    return Path(*[part for part in Path(path).parts if part not in ("..", "")])


def download_text(url: str, target: Path, timeout: int = 30) -> bool:
    target.parent.mkdir(parents=True, exist_ok=True)
    encoded = urllib.parse.quote(url, safe=":/?#[]@!$&'()*+,;=%")
    try:
        with urllib.request.urlopen(encoded, timeout=timeout) as resp:
            if getattr(resp, "status", 200) >= 400:
                return False
            data = resp.read()
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return False
        print(f"HTTP error {exc.code}: {url}", file=sys.stderr)
        return False
    except Exception as exc:  # network/auth issues should not crash full sync
        print(f"download failed: {url} ({exc})", file=sys.stderr)
        return False
    target.write_bytes(data)
    return True


def sync_sources(sources: dict, out_dir: Path, include_xml: bool, include_csv: bool) -> dict:
    report = {"downloaded": [], "missing_or_failed": []}
    selected = []
    if include_csv:
        selected.extend(sources.get("csv_sources", []))
    if include_xml:
        selected.extend(sources.get("xml_sources", []))

    for item in selected:
        target = out_dir / safe_relpath(item["path"])
        ok = download_text(item["raw_url"], target)
        record = {"id": item.get("id"), "path": item["path"], "target": str(target.relative_to(ROOT))}
        if ok:
            report["downloaded"].append(record)
        else:
            report["missing_or_failed"].append(record)
    return report


def sync_drive(folder_id: str, out_dir: Path) -> bool:
    if not folder_id:
        return False
    try:
        import gdown  # type: ignore
    except Exception:
        print("gdown is not installed. Run: pip install -r requirements.txt", file=sys.stderr)
        return False
    url = f"https://drive.google.com/drive/folders/{folder_id}"
    out_dir.mkdir(parents=True, exist_ok=True)
    # gdown.download_folder returns a list or None depending on version/permissions.
    result = gdown.download_folder(url=url, output=str(out_dir), quiet=False, use_cookies=False)
    return bool(result)


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync FormosanBank Puyuma source files and optional Drive audio folder.")
    parser.add_argument("--sources", type=Path, default=DEFAULT_SOURCES)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--csv-only", action="store_true", help="Download only CSV source files.")
    parser.add_argument("--xml-only", action="store_true", help="Download only XML source files.")
    parser.add_argument("--sync-drive", action="store_true", help="Also download the configured Google Drive audio folder with gdown.")
    parser.add_argument("--drive-folder-id", default=os.getenv("PUYUMA_AUDIO_DRIVE_FOLDER_ID", ""))
    args = parser.parse_args()

    sources = load_sources(args.sources)
    include_csv = not args.xml_only
    include_xml = not args.csv_only
    report = sync_sources(sources, args.out, include_xml=include_xml, include_csv=include_csv)

    if args.sync_drive:
        folder_id = args.drive_folder_id or sources.get("google_drive_audio_folder", {}).get("id", "")
        report["drive_synced"] = sync_drive(folder_id, ROOT / "external" / "puyuma_audio_drive")

    report_path = args.out / "sync_report.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["downloaded"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
