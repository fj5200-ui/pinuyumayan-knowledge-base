#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = ROOT / "openapi" / "pinuyumayan-main-site-api.openapi.json"

REQUIRED_PATHS = [
    "/health",
    "/api/public/knowledge/bootstrap",
    "/api/public/knowledge/search",
    "/api/public/knowledge/related",
    "/api/public/knowledge/communities/{communityKey}",
    "/api/public/knowledge/vocabulary",
    "/api/internal/main-site/knowledge/bundle",
    "/api/internal/main-site/knowledge/delta",
    "/api/ops/openapi.json",
]

if __name__ == "__main__":
    spec = json.loads(SPEC.read_text(encoding="utf-8"))
    assert spec.get("openapi", "").startswith("3."), "OpenAPI version must be 3.x"
    paths = spec.get("paths", {})
    missing = [p for p in REQUIRED_PATHS if p not in paths]
    if missing:
        raise SystemExit(f"missing OpenAPI paths: {missing}")
    schemes = spec.get("components", {}).get("securitySchemes", {})
    if "mainSiteApiKey" not in schemes:
        raise SystemExit("missing mainSiteApiKey security scheme")
    bundle = paths["/api/internal/main-site/knowledge/bundle"].get("get", {})
    if not bundle.get("security"):
        raise SystemExit("internal bundle must require security")
    print(f"openapi contract OK: {len(paths)} paths")
