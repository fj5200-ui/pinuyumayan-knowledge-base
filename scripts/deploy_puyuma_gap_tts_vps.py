#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import shlex
import subprocess
from pathlib import Path

import paramiko

ROOT = Path(__file__).resolve().parents[1]


def git_value(args: list[str], fallback: str) -> str:
    try:
        return subprocess.check_output(["git", "-C", str(ROOT), *args], text=True, encoding="utf-8").strip() or fallback
    except Exception:
        return fallback


def run_remote(client: paramiko.SSHClient, command: str, *, timeout: int = 3600) -> dict[str, object]:
    stdin, stdout, stderr = client.exec_command(command, timeout=timeout)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode("utf-8", "replace")
    err = stderr.read().decode("utf-8", "replace")
    return {"command": command, "exit_code": exit_code, "stdout": out, "stderr": err}


def main() -> int:
    parser = argparse.ArgumentParser(description="Deploy the Puyuma TTS gap-fill scaffold to a VPS over SSH.")
    parser.add_argument("--host", required=True)
    parser.add_argument("--port", type=int, default=22)
    parser.add_argument("--user", default="root")
    parser.add_argument("--password", default=os.getenv("PUYUMA_TTS_VPS_PASSWORD", ""))
    parser.add_argument("--remote-dir", default="/opt/pinuyumayan-knowledge-base")
    parser.add_argument("--repo-url", default=git_value(["remote", "get-url", "origin"], ""))
    parser.add_argument("--branch", default=git_value(["branch", "--show-current"], "main"))
    parser.add_argument("--install-tts-extras", action="store_true")
    parser.add_argument("--skip-audio-download", action="store_true")
    args = parser.parse_args()

    if not args.password:
        raise SystemExit("Missing --password or PUYUMA_TTS_VPS_PASSWORD")
    if not args.repo_url:
        raise SystemExit("Could not determine repo URL")

    quoted_remote = shlex.quote(args.remote_dir)
    quoted_repo = shlex.quote(args.repo_url)
    quoted_branch = shlex.quote(args.branch)

    clone_or_update = (
        "set -euo pipefail; "
        f"if [ -d {quoted_remote}/.git ]; then "
        f"cd {quoted_remote}; git fetch origin; git checkout {quoted_branch}; git pull --ff-only origin {quoted_branch}; "
        "else "
        f"rm -rf {quoted_remote}; git clone --branch {quoted_branch} {quoted_repo} {quoted_remote}; "
        "fi"
    )

    deploy_cmd = (
        "set -euo pipefail; "
        f"cd {quoted_remote}; "
        "chmod +x deploy/vps-puyuma-gap-tts-v65.sh training/formosanbank-puyuma-tts/scripts/bootstrap.sh; "
        f"APT_INSTALL=1 DOWNLOAD_AUDIO={'0' if args.skip_audio_download else '1'} "
        f"INSTALL_TTS_EXTRAS={'1' if args.install_tts_extras else '0'} "
        "LAUNCH_TTS=0 "
        "./deploy/vps-puyuma-gap-tts-v65.sh"
    )

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(
        hostname=args.host,
        port=args.port,
        username=args.user,
        password=args.password,
        timeout=20,
        banner_timeout=20,
        auth_timeout=20,
    )
    try:
        results = [
            run_remote(client, "uname -a"),
            run_remote(client, clone_or_update, timeout=1800),
            run_remote(client, deploy_cmd, timeout=7200),
        ]
    finally:
        client.close()

    print(json.dumps(results, ensure_ascii=False, indent=2))
    failed = next((result for result in results if int(result["exit_code"]) != 0), None)
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
