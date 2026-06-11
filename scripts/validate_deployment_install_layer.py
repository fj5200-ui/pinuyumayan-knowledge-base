#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRED = [
    "deploy/install.sh",
    "deploy/postdeploy-full-corpus.sh",
    "deploy/bootstrap-preview-db.sh",
    "deploy/healthcheck.sh",
    "deploy/systemd/pinuyumayan-backend.service",
    "deploy/nginx/pinuyumayan-backend.conf.example",
    "data/deployment/deployment_install_plan.json",
    "data/deployment/full_corpus_postdeploy_job.json",
    "docs/deployment_installation_guide.md",
    "scripts/deploy_database.py",
    "scripts/deploy_full_corpus_import.py",
    "scripts/import_generated_sql.py",
    "scripts/healthcheck_main_site_api.py",
]


def main() -> int:
    missing = [p for p in REQUIRED if not (ROOT / p).exists()]
    if missing:
        raise SystemExit("missing deployment files: " + ", ".join(missing))
    plan = json.loads((ROOT / "data/deployment/deployment_install_plan.json").read_text(encoding="utf-8"))
    modes = {m["key"] for m in plan.get("modes", [])}
    expected = {"preview", "full-corpus-postdeploy", "full-corpus-blocking"}
    if not expected.issubset(modes):
        raise SystemExit(f"deployment modes incomplete: {modes}")
    pkg = json.loads((ROOT / "backend/package.json").read_text(encoding="utf-8"))
    scripts = pkg.get("scripts", {})
    for key in ["deploy:install", "postdeploy:full-corpus", "db:bootstrap:preview"]:
        if key not in scripts:
            raise SystemExit(f"backend/package.json missing script {key}")
    print("deployment install layer OK: preview bootstrap, postdeploy full corpus, healthcheck, systemd/nginx/docker docs")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
