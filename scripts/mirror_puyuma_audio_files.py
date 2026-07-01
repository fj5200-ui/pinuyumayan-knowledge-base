#!/usr/bin/env python3
"""Mirror full Puyuma audio entries into a local MP3 package.

This script downloads each unique remote audio URL once, converts WAV sources
to MP3, expands them into one file per corpus entry, and can optionally build
an uncompressed ZIP package for delivery.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]


def quote_url(url: str) -> str:
    return urllib.parse.quote(url, safe=":/?#[]@!$&'()*+,;=%")


def load_ffmpeg_exe() -> str:
    try:
        import imageio_ffmpeg
    except ModuleNotFoundError as exc:  # pragma: no cover - environment dependent
        raise RuntimeError("imageio-ffmpeg is required for WAV to MP3 conversion") from exc
    return imageio_ffmpeg.get_ffmpeg_exe()


def sha1_text(value: str) -> str:
    return hashlib.sha1(value.encode("utf-8")).hexdigest()


def file_size_bytes(path: Path) -> int:
    total = 0
    for item in path.rglob("*"):
        if item.is_file():
            total += item.stat().st_size
    return total


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def download_response(url: str, timeout: int) -> tuple[int, str, bytes]:
    with urllib.request.urlopen(quote_url(url), timeout=timeout) as response:
        status = getattr(response, "status", 200) or 200
        content_type = response.headers.get_content_type()
        return status, content_type, response.read()


def is_probable_mp3(audio_bytes: bytes) -> bool:
    if len(audio_bytes) < 3:
        return False
    if audio_bytes.startswith(b"ID3"):
        return True
    return audio_bytes[0] == 0xFF and (audio_bytes[1] & 0xE0) == 0xE0


def is_probable_wav(audio_bytes: bytes) -> bool:
    return len(audio_bytes) >= 12 and audio_bytes[:4] == b"RIFF" and audio_bytes[8:12] == b"WAVE"


def validate_audio_payload(url: str, mime_type: str, content_type: str, audio_bytes: bytes) -> None:
    if not audio_bytes:
        raise RuntimeError("empty response")
    if content_type.startswith("text/"):
        raise RuntimeError(f"unexpected content-type {content_type}")
    wants_wav = mime_type == "audio/wav" or url.lower().endswith(".wav")
    if wants_wav:
        if not is_probable_wav(audio_bytes):
            raise RuntimeError(f"unexpected wav payload: content-type={content_type}")
        return
    if not is_probable_mp3(audio_bytes):
        raise RuntimeError(f"unexpected mp3 payload: content-type={content_type}")


def failure_kind(error: str) -> str:
    lowered = error.lower()
    if "http error 404" in lowered or "http error 410" in lowered:
        return "missing_upstream"
    if "timed out" in lowered or "timeout" in lowered:
        return "timeout"
    if "unexpected content-type" in lowered or "unexpected mp3 payload" in lowered or "unexpected wav payload" in lowered:
        return "invalid_audio_payload"
    return "download_error"


def should_retry(exc: Exception) -> bool:
    if isinstance(exc, urllib.error.HTTPError) and exc.code in {404, 410}:
        return False
    return True


def convert_wav_to_mp3(ffmpeg_exe: str, src_wav: Path, dst_mp3: Path) -> None:
    ensure_parent(dst_mp3)
    cmd = [
        ffmpeg_exe,
        "-y",
        "-i",
        str(src_wav),
        "-vn",
        "-acodec",
        "libmp3lame",
        "-q:a",
        "4",
        str(dst_mp3),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip() or "ffmpeg conversion failed")


def mirror_unique_audio(
    items: list[dict[str, Any]],
    cache_dir: Path,
    workers: int,
    timeout: int,
    retries: int,
    ffmpeg_exe: str,
) -> dict[str, Any]:
    cache_dir.mkdir(parents=True, exist_ok=True)
    tmp_dir = cache_dir / "_tmp"
    tmp_dir.mkdir(parents=True, exist_ok=True)

    progress_lock = threading.Lock()
    progress = {"done": 0, "ok": 0, "skip": 0, "fail": 0}
    failures: list[dict[str, Any]] = []
    total = len(items)

    def log_progress() -> None:
        with progress_lock:
            done = progress["done"]
            if done == total or done % 250 == 0:
                print(
                    f"unique audio progress: {done}/{total} "
                    f"(ok={progress['ok']}, skip={progress['skip']}, fail={progress['fail']})"
                )

    def worker(item: dict[str, Any]) -> dict[str, Any]:
        url = item["url"]
        mime_type = item["mime_type"]
        cache_name = f"{sha1_text(url)}.mp3"
        cache_path = cache_dir / cache_name
        if cache_path.exists() and cache_path.stat().st_size > 0:
            with progress_lock:
                progress["done"] += 1
                progress["skip"] += 1
            log_progress()
            return {"url": url, "cache_path": str(cache_path), "status": "skipped"}

        last_error = ""
        for attempt in range(1, retries + 1):
            wav_tmp = tmp_dir / f"{sha1_text(url)}-{attempt}.wav"
            out_tmp = tmp_dir / f"{sha1_text(url)}-{attempt}.mp3"
            try:
                _status, content_type, audio_bytes = download_response(url, timeout=timeout)
                validate_audio_payload(url=url, mime_type=mime_type, content_type=content_type, audio_bytes=audio_bytes)
                if mime_type == "audio/wav" or url.lower().endswith(".wav"):
                    wav_tmp.write_bytes(audio_bytes)
                    convert_wav_to_mp3(ffmpeg_exe, wav_tmp, out_tmp)
                    ensure_parent(cache_path)
                    shutil.move(str(out_tmp), str(cache_path))
                else:
                    ensure_parent(cache_path)
                    cache_path.write_bytes(audio_bytes)
                with progress_lock:
                    progress["done"] += 1
                    progress["ok"] += 1
                log_progress()
                return {"url": url, "cache_path": str(cache_path), "status": "downloaded"}
            except Exception as exc:  # pragma: no cover - network dependent
                last_error = str(exc)
                if not should_retry(exc):
                    break
                time.sleep(min(3 * attempt, 10))
            finally:
                if wav_tmp.exists():
                    wav_tmp.unlink()
                if out_tmp.exists():
                    out_tmp.unlink()
        with progress_lock:
            progress["done"] += 1
            progress["fail"] += 1
        log_progress()
        return {
            "url": url,
            "cache_path": str(cache_path),
            "status": "failed",
            "error": last_error,
            "failure_kind": failure_kind(last_error),
        }

    with ThreadPoolExecutor(max_workers=workers) as executor:
        future_map = {executor.submit(worker, item): item for item in items}
        for future in as_completed(future_map):
            result = future.result()
            if result["status"] == "failed":
                failures.append(result)

    failure_kinds = Counter(result["failure_kind"] for result in failures)
    failure_domains = Counter(urllib.parse.urlparse(result["url"]).netloc for result in failures)
    return {
        "total_unique_urls": total,
        "downloaded": progress["ok"],
        "skipped_existing": progress["skip"],
        "failed": progress["fail"],
        "failure_kind_counts": dict(failure_kinds),
        "failure_domain_counts": dict(failure_domains),
        "failures": failures,
    }


def expand_entry_package(entries: list[dict[str, Any]], url_to_cache: dict[str, Path], out_dir: Path) -> dict[str, Any]:
    out_dir.mkdir(parents=True, exist_ok=True)
    copied = 0
    skipped = 0
    missing = []
    for index, entry in enumerate(entries, start=1):
        url = entry["audio"]["url"]
        src = url_to_cache.get(url)
        target = out_dir / f"{entry['id']}.mp3"
        if src is None or not src.exists():
            missing.append({"id": entry["id"], "url": url})
            continue
        if target.exists() and target.stat().st_size == src.stat().st_size and target.stat().st_size > 0:
            skipped += 1
        else:
            shutil.copyfile(src, target)
            copied += 1
        if index % 1000 == 0 or index == len(entries):
            print(f"entry package progress: {index}/{len(entries)} (copied={copied}, skipped={skipped}, missing={len(missing)})")
    return {
        "entry_count": len(entries),
        "copied": copied,
        "skipped_existing": skipped,
        "missing": len(missing),
        "missing_samples": missing[:50],
    }


def build_zip(src_dir: Path, zip_path: Path) -> dict[str, Any]:
    ensure_parent(zip_path)
    if zip_path.exists():
        zip_path.unlink()
    file_count = 0
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_STORED) as archive:
        for file_path in sorted(src_dir.rglob("*")):
            if not file_path.is_file():
                continue
            archive.write(file_path, arcname=file_path.relative_to(src_dir))
            file_count += 1
            if file_count % 1000 == 0:
                print(f"zip progress: {file_count} files")
    return {
        "file_count": file_count,
        "zip_path": str(zip_path),
        "zip_size_bytes": zip_path.stat().st_size if zip_path.exists() else 0,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--entries", type=Path, default=ROOT / "data/web/puyuma_vocabulary_audio_entries.json")
    parser.add_argument("--cache-dir", type=Path, default=ROOT / "artifacts/puyuma_audio_unique_mp3_cache")
    parser.add_argument("--out-dir", type=Path, default=ROOT / "artifacts/puyuma_audio_mp3_package/audio")
    parser.add_argument("--zip-path", type=Path, default=ROOT / "artifacts/puyuma_audio_mp3_package.zip")
    parser.add_argument("--report", type=Path, default=ROOT / "artifacts/puyuma_audio_mp3_package_report.json")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--workers", type=int, default=12)
    parser.add_argument("--timeout", type=int, default=60)
    parser.add_argument("--retries", type=int, default=3)
    parser.add_argument("--allow-partial", action="store_true")
    parser.add_argument("--skip-zip", action="store_true")
    args = parser.parse_args()

    data = json.loads(args.entries.read_text(encoding="utf-8"))
    entries = data.get("entries", [])
    if args.limit:
        entries = entries[: args.limit]
    if not entries:
        raise SystemExit("no entries to mirror")

    ffmpeg_exe = load_ffmpeg_exe()
    unique_by_url: dict[str, dict[str, Any]] = {}
    for entry in entries:
        url = entry["audio"]["url"]
        if url not in unique_by_url:
            unique_by_url[url] = {
                "url": url,
                "mime_type": entry["audio"].get("mime_type", "audio/mpeg"),
            }

    print(f"entries={len(entries)} unique_urls={len(unique_by_url)} workers={args.workers}")
    unique_report = mirror_unique_audio(
        items=list(unique_by_url.values()),
        cache_dir=args.cache_dir,
        workers=max(1, args.workers),
        timeout=args.timeout,
        retries=max(1, args.retries),
        ffmpeg_exe=ffmpeg_exe,
    )
    if unique_report["failed"] and not args.allow_partial:
        args.report.write_text(json.dumps({"status": "failed", "unique_report": unique_report}, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"mirror failed; report={args.report}")
        return 1

    url_to_cache = {url: args.cache_dir / f"{sha1_text(url)}.mp3" for url in unique_by_url}
    expanded_report = expand_entry_package(entries, url_to_cache, args.out_dir)
    if expanded_report["missing"] and not args.allow_partial:
        args.report.write_text(
            json.dumps({"status": "failed_missing_expanded_entries", "unique_report": unique_report, "expanded_report": expanded_report}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"entry expansion failed; report={args.report}")
        return 1

    zip_report = None
    if not args.skip_zip:
        zip_report = build_zip(args.out_dir, args.zip_path)

    cache_size_bytes = file_size_bytes(args.cache_dir)
    out_size_bytes = file_size_bytes(args.out_dir)
    status = "ok"
    if unique_report["failed"] or expanded_report["missing"]:
        status = "partial_ok" if args.allow_partial else "failed"
    report = {
        "status": status,
        "entries": len(entries),
        "unique_urls": len(unique_by_url),
        "ffmpeg_exe": ffmpeg_exe,
        "unique_report": unique_report,
        "expanded_report": expanded_report,
        "cache_dir": str(args.cache_dir),
        "cache_size_bytes": cache_size_bytes,
        "out_dir": str(args.out_dir),
        "out_size_bytes": out_size_bytes,
        "zip_report": zip_report,
    }
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"mirror complete; report={args.report}")
    print(f"cache_size_bytes={cache_size_bytes} out_size_bytes={out_size_bytes}")
    if zip_report:
        print(f"zip_size_bytes={zip_report['zip_size_bytes']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
