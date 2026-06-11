#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_FILES = [
    "openapi/pinuyumayan-main-site-api.openapi.json",
    "data/integration/main_site_delivery_runtime_v9.json",
    "data/integration/main_site_query_presets_v9.json",
    "data/integration/webhook_revalidation_policy_v9.json",
    "data/deployment/cicd_pipeline_v9.json",
    "database/migrations/0005_delivery_runtime.sql",
    "backend/src/lib/env.ts",
    "backend/src/lib/cacheHeaders.ts",
    "backend/src/security/rateLimit.ts",
    "backend/src/rest/openapiRoutes.ts",
    "backend/src/rest/runtimeOpsRoutes.ts",
    "backend/src/workers/fullCorpusImportWorker.ts",
    "backend/src/workers/webhookDeliveryWorker.ts",
    "docs/openapi_and_sdk_usage.md",
    "docs/main_site_delivery_runtime_v9.md",
    "docs/cicd_and_contract_testing_v9.md",
    ".github/workflows/ci.yml",
    "deploy/check-main-site-pull.sh",
]

REQUIRED_SQL_TABLES = [
    "api_cache_entries",
    "api_rate_limit_events",
    "webhook_subscriptions",
    "webhook_outbox_events",
    "search_reindex_queue",
    "corpus_import_file_manifest",
    "corpus_import_checkpoints",
    "main_site_pull_tokens",
    "data_export_artifacts",
]

if __name__ == "__main__":
    missing = [p for p in REQUIRED_FILES if not (ROOT / p).exists()]
    if missing:
        raise SystemExit(f"missing v9 delivery runtime files: {missing}")

    spec = json.loads((ROOT / "openapi/pinuyumayan-main-site-api.openapi.json").read_text(encoding="utf-8"))
    for path in ["/api/public/knowledge/bootstrap", "/api/public/knowledge/vocabulary", "/api/internal/main-site/knowledge/bundle"]:
        if path not in spec.get("paths", {}):
            raise SystemExit(f"missing OpenAPI path: {path}")

    runtime = json.loads((ROOT / "data/integration/main_site_delivery_runtime_v9.json").read_text(encoding="utf-8"))
    if runtime.get("version") != "v9":
        raise SystemExit("delivery runtime version must be v9")
    if runtime.get("pagination", {}).get("max_public_limit", 0) > 100:
        raise SystemExit("public limit too high")

    sql = (ROOT / "database/migrations/0005_delivery_runtime.sql").read_text(encoding="utf-8")
    missing_tables = [t for t in REQUIRED_SQL_TABLES if t not in sql]
    if missing_tables:
        raise SystemExit(f"missing SQL tables: {missing_tables}")

    pkg = json.loads((ROOT / "backend/package.json").read_text(encoding="utf-8"))
    for script in ["validate:delivery-runtime", "contract:openapi", "worker:full-corpus", "worker:webhook-delivery", "ci:all"]:
        if script not in pkg.get("scripts", {}):
            raise SystemExit(f"missing package script: {script}")

    print(f"delivery runtime layer OK: {len(REQUIRED_FILES)} files, {len(REQUIRED_SQL_TABLES)} SQL tables, {len(spec.get('paths', {}))} OpenAPI paths")
