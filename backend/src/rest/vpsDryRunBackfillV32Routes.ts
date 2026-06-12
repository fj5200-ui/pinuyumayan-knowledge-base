import type { Express, Request, Response } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";

function readJson(relativePath: string, fallback: unknown) {
  const candidates = [
    path.resolve(process.cwd(), relativePath),
    path.resolve(process.cwd(), "..", relativePath),
    path.resolve(__dirname, "../../../", relativePath),
  ];
  for (const file of candidates) {
    try { if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8")); } catch (err) { return { error: "invalid_json", file, detail: String(err), fallback }; }
  }
  return fallback;
}
function sha256(value: unknown) { return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
function accepted(req: Request, res: Response, kind: string) { const payload = req.body ?? {}; res.json({ ok: true, version: "v32", kind, payloadHash: sha256(payload), status: payload.status ?? "received", receivedAt: new Date().toISOString() }); }

export function registerVpsDryRunBackfillV32Routes(app: Express) {
  app.get("/api/ops/vps/v32/dry-run-backfill-plan", (_req, res) => res.json({ ok: true, plan: readJson("data/deployment/vps_dry_run_backfill_v32.json", { version: "v32" }) }));
  app.post("/api/internal/vps/v32/dry-run-backfill-report", (req, res) => accepted(req, res, "vps_dry_run_backfill_report"));

  app.get("/api/ops/main-site/v32/migration-secret-scan", (_req, res) => res.json({ ok: true, scan: readJson("data/integration/main_site_migration_secret_scan_v32.json", { version: "v32" }) }));
  app.post("/api/internal/main-site/v32/migration-secret-scan-report", (req, res) => accepted(req, res, "main_site_secret_scan_report"));

  app.get("/api/ops/security/v32/hmac-enforcement", (_req, res) => res.json({ ok: true, enforcement: readJson("data/security/internal_hmac_enforcement_v32.json", { version: "v32" }) }));
  app.post("/api/internal/security/v32/hmac-enforcement-report", (req, res) => accepted(req, res, "hmac_enforcement_report"));

  app.get("/api/admin/corpus/v32/full-corpus-backfill", (_req, res) => res.json({ ok: true, contract: readJson("data/database/full_corpus_backfill_contract_v32.json", { version: "v32" }) }));
  app.post("/api/internal/corpus/v32/full-corpus-backfill-report", (req, res) => accepted(req, res, "full_corpus_backfill_report"));

  app.get("/api/admin/dashboard/v32/live-bindings", (_req, res) => res.json({ ok: true, bindings: readJson("data/admin/live_dashboard_api_bindings_v32.json", { version: "v32" }) }));

  app.get("/api/ops/search-seo/v32/validation-suite", (_req, res) => res.json({ ok: true, suite: readJson("data/search/search_seo_validation_v32.json", { version: "v32" }) }));
  app.post("/api/internal/search-seo/v32/validation-report", (req, res) => accepted(req, res, "search_seo_validation_report"));

  app.get("/api/ops/fallback/v32/enforcement", (_req, res) => res.json({ ok: true, policy: readJson("data/deployment/production_static_fallback_enforcement_v32.json", { version: "v32" }) }));
  app.post("/api/internal/fallback/v32/enforcement-report", (req, res) => accepted(req, res, "production_fallback_enforcement_report"));

  app.get("/api/ops/next-upgrade-plan/v33", (_req, res) => res.json({ ok: true, plan: readJson("data/development/next_upgrade_plan_v33.json", { version: "v33", priorities: [] }) }));
}
