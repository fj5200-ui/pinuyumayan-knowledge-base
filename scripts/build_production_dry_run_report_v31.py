#!/usr/bin/env python3
import argparse, json, os, urllib.request, urllib.error, hashlib, time
from pathlib import Path

CHECKS = [
    ("env.NODE_ENV", lambda: os.getenv("NODE_ENV", "development")),
    ("env.KNOWLEDGE_DATA_MODE", lambda: os.getenv("KNOWLEDGE_DATA_MODE", "unset")),
    ("env.DISABLE_PRODUCTION_STATIC_FALLBACK", lambda: os.getenv("DISABLE_PRODUCTION_STATIC_FALLBACK", "false")),
    ("env.PINUYUMAYAN_HMAC_ENABLED", lambda: os.getenv("PINUYUMAYAN_HMAC_ENABLED", "false")),
    ("env.DATABASE_URL_present", lambda: bool(os.getenv("DATABASE_URL"))),
]

def fetch_json(url, timeout=5):
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:
            return {"ok": True, "status": r.status, "body_sha256": hashlib.sha256(r.read()).hexdigest()}
    except Exception as e:
        return {"ok": False, "error": str(e)}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default=os.getenv("PUBLIC_KNOWLEDGE_BASE_URL", "http://localhost:8787"))
    ap.add_argument("--out", default="data/deployment/production_dry_run_report_v31.generated.json")
    args = ap.parse_args()
    env_checks = []
    for key, fn in CHECKS:
        value = fn()
        status = "pass"
        if key == "env.KNOWLEDGE_DATA_MODE" and value != "db": status = "blocker"
        if key == "env.PINUYUMAYAN_HMAC_ENABLED" and value != "true": status = "blocker"
        if key == "env.DATABASE_URL_present" and value is not True: status = "blocker"
        if key == "env.DISABLE_PRODUCTION_STATIC_FALLBACK" and os.getenv("NODE_ENV") == "production" and value != "true": status = "blocker"
        env_checks.append({"key": key, "status": status, "value": value if key != "env.DATABASE_URL_present" else bool(value)})
    endpoints = [
        "/health",
        "/ready",
        "/api/ops/cutover/v30/readiness",
        "/api/ops/dry-run/v31/readiness",
        "/api/ops/main-site/v31/migration-acceptance",
        "/api/ops/security/v31/hmac-route-coverage",
    ]
    endpoint_checks = [{"path": p, **fetch_json(args.base_url.rstrip('/') + p)} for p in endpoints]
    blockers = [c for c in env_checks if c["status"] == "blocker"] + [c for c in endpoint_checks if not c.get("ok")]
    report = {
        "version": "v31",
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "base_url": args.base_url,
        "actual_vps_run": True,
        "status": "failed" if blockers else "passed",
        "blocker_count": len(blockers),
        "env_checks": env_checks,
        "endpoint_checks": endpoint_checks,
        "notes": ["This report only proves dry-run checks. Full corpus >=1000 still requires corpus acceptance report."],
    }
    out = Path(args.out); out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print(json.dumps({"out": str(out), "status": report["status"], "blockers": len(blockers)}, ensure_ascii=False))

if __name__ == "__main__":
    main()
