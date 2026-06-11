#!/usr/bin/env python3
from pathlib import Path
import json, re, sys
ROOT = Path(__file__).resolve().parents[1]
required = [
  "database/migrations/0011_performance_security_search_v14.sql",
  "data/runtime/performance_cache_policy_v14.json",
  "data/security/api_security_policy_v14.json",
  "data/security/admin_rbac_scope_v14.json",
  "data/search/search_relevance_profile_v14.json",
  "data/integration/main_site_sync_sla_v14.json",
  "data/database/data_quality_gate_v14.json",
  "data/content/content_enrichment_tasks_v14.json",
  "backend/src/security/scopeGuard.ts",
  "backend/src/lib/publicCache.ts",
  "backend/src/modules/search/service.ts",
  "frontend-sdk/pinuyumayanKnowledgeClient.v14.ts",
  "docs/performance_security_search_v14.md",
  "openapi/pinuyumayan-main-site-api.openapi.json",
]
missing = [p for p in required if not (ROOT / p).exists()]
if missing:
    raise SystemExit("missing v14 files: " + ", ".join(missing))

sql = (ROOT / "database/migrations/0011_performance_security_search_v14.sql").read_text(encoding="utf-8")
for table in ["admin_mfa_factors", "search_synonyms", "cache_invalidation_jobs", "corpus_import_retry_queue", "data_quality_gate_results_v14"]:
    if table not in sql:
        raise SystemExit(f"missing table in v14 migration: {table}")

openapi = json.loads((ROOT / "openapi/pinuyumayan-main-site-api.openapi.json").read_text(encoding="utf-8"))
paths = openapi.get("paths", {})
for path in ["/api/public/search/suggest", "/api/public/search/facets", "/api/internal/cache/invalidate", "/api/internal/data-quality/run", "/api/admin/security/sessions"]:
    if path not in paths:
        raise SystemExit(f"missing OpenAPI path: {path}")

tasks = json.loads((ROOT / "data/content/content_enrichment_tasks_v14.json").read_text(encoding="utf-8"))
if tasks.get("count", 0) < 50:
    raise SystemExit("expected at least 50 content enrichment tasks")

policy = json.loads((ROOT / "data/security/api_security_policy_v14.json").read_text(encoding="utf-8"))
if "No default passwords" not in policy.get("principles", []):
    raise SystemExit("security policy must forbid default passwords")

print(f"upgrade optimization v14 OK: {len(required)} files, {len(paths)} OpenAPI paths, {tasks['count']} content tasks")
