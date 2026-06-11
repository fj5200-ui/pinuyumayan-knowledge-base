import type { Express } from "express";
import { ok } from "../lib/apiResponse";
import { env } from "../lib/env";

export function registerReadinessRoutes(app: Express) {
  app.get("/ready", (_req, res) => {
    const checks = {
      env: true,
      databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
      staticFallbackEnabled: process.env.KNOWLEDGE_DATA_MODE === "static",
      mainSiteKeyConfigured: Boolean(env.mainSiteApiKey || process.env.MAIN_SITE_API_KEY),
      fullCorpusImportAtStartup: false
    };
    const ready = (checks.databaseUrlConfigured || checks.staticFallbackEnabled) && (env.nodeEnv !== "production" || checks.mainSiteKeyConfigured);
    return ok(res, { ready, checks, version: "v16" }, ready ? 200 : 503);
  });

  app.get("/api/ops/readiness", (_req, res) => {
    return ok(res, {
      version: "v16",
      service: "pinuyumayan-backend-database",
      checks: [
        { id: "env", ok: true },
        { id: "database_url_configured", ok: Boolean(process.env.DATABASE_URL) },
        { id: "static_json_fallback_enabled", ok: process.env.KNOWLEDGE_DATA_MODE === "static" },
        { id: "main_site_key_configured", ok: Boolean(env.mainSiteApiKey || process.env.MAIN_SITE_API_KEY) },
        { id: "full_corpus_import_at_startup", ok: false, expected: false }
      ]
    });
  });
}
