#!/usr/bin/env python3
"""Synthesize the 19 missing Puyuma audio gaps from the public Gradio app.

The app exposes a Gradio `lambda` endpoint that switches the speaker choices
after selecting the ethnicity. For Puyuma, the TTS endpoint only accepts the
speaker value after the session has been primed with `卑南`, so this script
keeps a dedicated session per dialect and reuses it for the rows in that
dialect.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


WORKSPACE_ROOT = Path(__file__).resolve().parents[2]
REPO_ROOT = Path(__file__).resolve().parents[1]

DEFAULT_APP_URL = "https://ai-labs.ilrdf.org.tw/hnang-kari-ai-asi-sluhay/"
DEFAULT_MANIFEST = REPO_ROOT / "data" / "audio" / "puyuma_tts_gap_manifest_v65.jsonl"
DEFAULT_PACKAGE_AUDIO_DIR = WORKSPACE_ROOT / "artifacts" / "puyuma_audio_mp3_package_hf" / "audio"
DEFAULT_WAV_DIR = WORKSPACE_ROOT / "artifacts" / "synthetic_gap_fill"
DEFAULT_REPORT = WORKSPACE_ROOT / "artifacts" / "puyuma_audio_gap_fill_tts_report_v1.json"

SPEAKER_BY_DIALECT = {
    "Jianhe_Puyuma": "卑南_建和_女聲",
    "Nanwang_Puyuma": "卑南_南王_女聲",
    "Xiqun_Puyuma": "卑南_西群_女聲",
    "Zhiben_Puyuma": "卑南_知本_女聲",
}

_TTS_STRIP_CHARS = str.maketrans({
    "(": "",
    ")": "",
    "（": "",
    "）": "",
    "[": "",
    "]": "",
    "【": "",
    "】": "",
})


def load_manifest(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as fp:
        for line in fp:
            line = line.strip()
            if not line:
                continue
            rows.append(json.loads(line))
    return rows


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def post_json(url: str, payload: dict[str, Any], *, timeout: int = 120) -> dict[str, Any]:
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "Codex-Puyuma-Gap-Fill/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace") if exc.fp else ""
        raise RuntimeError(f"POST {url} failed with HTTP {exc.code}: {body}") from exc


def locate_ffmpeg() -> str:
    found = shutil.which("ffmpeg")
    if found:
        return found
    try:
        import imageio_ffmpeg  # type: ignore

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception as exc:  # pragma: no cover - environment specific fallback
        raise RuntimeError("ffmpeg not found in PATH and imageio_ffmpeg is unavailable") from exc


def fetch_api_index(app_url: str, api_name: str) -> int:
    html = urllib.request.urlopen(app_url, timeout=60).read().decode("utf-8")
    match = re.search(r"window\.gradio_config\s*=\s*(\{.*?\})\s*;", html, re.S)
    if not match:
        raise RuntimeError("Could not locate gradio_config in app HTML")
    config = json.loads(match.group(1))
    for dep in config.get("dependencies", []):
        if dep.get("api_name") == api_name:
            return int(dep["id"])
    raise RuntimeError(f"Could not find api_name={api_name!r} in gradio config")


def prime_session(app_url: str, fn_index: int, session_hash: str, dialect: str, speaker: str) -> None:
    payload = {
        "data": ["卑南"],
        "fn_index": fn_index,
        "session_hash": session_hash,
    }
    result = post_json(f"{app_url.rstrip('/')}/gradio_api/run/lambda", payload)
    choices = []
    if result.get("data"):
        choices = result["data"][0].get("choices", [])
    allowed = {item[0] if isinstance(item, list) and item else item for item in choices}
    if speaker not in allowed:
        raise RuntimeError(
            f"Speaker {speaker!r} is not available for {dialect!r}; choices={sorted(allowed)!r}"
        )


def synthesize_audio(
    app_url: str,
    fn_index: int,
    session_hash: str,
    speaker: str,
    text: str,
    *,
    retries: int = 3,
) -> dict[str, Any]:
    payload = {
        "data": [speaker, text],
        "fn_index": fn_index,
        "session_hash": session_hash,
    }
    last_error: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            result = post_json(f"{app_url.rstrip('/')}/gradio_api/run/default_speaker_tts", payload)
            if not result.get("data"):
                raise RuntimeError(f"Missing data field in TTS response: {result!r}")
            file_info = result["data"][0]
            if not isinstance(file_info, dict) or "url" not in file_info:
                raise RuntimeError(f"Unexpected TTS file payload: {file_info!r}")
            return file_info
        except Exception as exc:  # transient network / queue / server failures
            last_error = exc
            if attempt < retries:
                time.sleep(1.0 * attempt)
                continue
            raise
    assert last_error is not None
    raise last_error


def download_file(url: str, target: Path) -> None:
    ensure_parent(target)
    with urllib.request.urlopen(url, timeout=120) as resp:
        data = resp.read()
    target.write_bytes(data)


def convert_wav_to_mp3(wav_path: Path, mp3_path: Path, ffmpeg_exe: str) -> None:
    ensure_parent(mp3_path)
    cmd = [
        ffmpeg_exe,
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        str(wav_path),
        "-codec:a",
        "libmp3lame",
        "-q:a",
        "4",
        str(mp3_path),
    ]
    subprocess.run(cmd, check=True)


def stable_session_id(dialect: str) -> str:
    return hashlib.sha1(f"puyuma-gap-fill::{dialect}".encode("utf-8")).hexdigest()


def sanitize_tts_text(text: str) -> str:
    cleaned = text.translate(_TTS_STRIP_CHARS)
    return re.sub(r"\s+", " ", cleaned).strip()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Synthesize the 19 missing Puyuma audio gaps")
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--app-url", type=str, default=DEFAULT_APP_URL)
    parser.add_argument("--package-audio-dir", type=Path, default=DEFAULT_PACKAGE_AUDIO_DIR)
    parser.add_argument("--wav-dir", type=Path, default=DEFAULT_WAV_DIR)
    parser.add_argument("--report", type=Path, default=DEFAULT_REPORT)
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--pause-seconds", type=float, default=0.2)
    return parser


def main(argv: list[str] | None = None) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")

    args = build_parser().parse_args(argv)

    if not args.manifest.exists():
        raise SystemExit(f"Missing manifest: {args.manifest}")
    rows = load_manifest(args.manifest)
    if not rows:
        raise SystemExit("Manifest is empty")

    api_index = fetch_api_index(args.app_url, "default_speaker_tts")
    lambda_index = fetch_api_index(args.app_url, "lambda")
    results: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []
    ffmpeg_exe = locate_ffmpeg()

    # Prime one Gradio session per dialect so the updated speaker dropdown stays valid.
    sessions: dict[str, str] = {}
    for dialect, speaker in sorted({(str(row["dialect"]), SPEAKER_BY_DIALECT[str(row["dialect"])]) for row in rows}):
        session_hash = stable_session_id(dialect)
        prime_session(args.app_url, lambda_index, session_hash, dialect, speaker)
        sessions[dialect] = session_hash

    for row in rows:
        entry_id = str(row["entry_id"])
        dialect = str(row["dialect"])
        text = str(row.get("normalized_text") or row.get("text") or "").strip()
        tts_text = sanitize_tts_text(text)
        speaker = SPEAKER_BY_DIALECT.get(dialect)
        if speaker is None:
            failures.append({"entry_id": entry_id, "error": f"Unsupported dialect: {dialect}"})
            continue

        wav_name = Path(str(row.get("replacement_output_relpath", f"{entry_id}.wav"))).name
        wav_path = args.wav_dir / wav_name
        mp3_path = args.package_audio_dir / f"{entry_id}.mp3"
        if mp3_path.exists() and mp3_path.stat().st_size > 0 and not args.overwrite:
            results.append(
                {
                    "entry_id": entry_id,
                    "dialect": dialect,
                    "speaker": speaker,
                    "text": text,
                    "tts_text": tts_text,
                    "wav_path": str(wav_path),
                    "mp3_path": str(mp3_path),
                    "status": "skipped_existing",
                }
            )
            continue

        print(f"[{len(results) + len(failures) + 1}/{len(rows)}] {entry_id} {dialect} -> {speaker}", flush=True)

        file_info = synthesize_audio(
            args.app_url,
            api_index,
            sessions[dialect],
            speaker,
            tts_text,
        )
        download_file(str(file_info["url"]), wav_path)
        convert_wav_to_mp3(wav_path, mp3_path, ffmpeg_exe)
        results.append(
            {
                "entry_id": entry_id,
                "dialect": dialect,
                "speaker": speaker,
                "text": text,
                "tts_text": tts_text,
                "wav_path": str(wav_path),
                "mp3_path": str(mp3_path),
                "status": "synthesized",
                "source_url": file_info.get("url"),
                "wav_bytes": wav_path.stat().st_size,
                "mp3_bytes": mp3_path.stat().st_size,
            }
        )
        if args.pause_seconds:
            time.sleep(args.pause_seconds)

    total_mp3_bytes = sum(Path(item["mp3_path"]).stat().st_size for item in results if Path(item["mp3_path"]).exists())
    total_wav_bytes = sum(Path(item["wav_path"]).stat().st_size for item in results if Path(item["wav_path"]).exists())
    report = {
        "status": "complete" if not failures else "partial_ok",
        "entries": len(rows),
        "synthesized": sum(1 for item in results if item["status"] == "synthesized"),
        "skipped_existing": sum(1 for item in results if item["status"] == "skipped_existing"),
        "failed": len(failures),
        "ffmpeg_exe": ffmpeg_exe,
        "app_url": args.app_url,
        "speaker_by_dialect": SPEAKER_BY_DIALECT,
        "package_audio_dir": str(args.package_audio_dir),
        "wav_dir": str(args.wav_dir),
        "total_mp3_bytes": total_mp3_bytes,
        "total_wav_bytes": total_wav_bytes,
        "results": results,
        "failures": failures,
    }

    ensure_parent(args.report)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
