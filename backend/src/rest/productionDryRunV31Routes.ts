import type { Express, Request, Response } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";

function readJson(relativePath: string, fallback: unknown) {
  const cwd = process.cwd();
  const candidates = [
    path.resolve(cwd, relativePath),
    path.resolve(cwd, "..", relativePath),
    path.resolve(__dirname, "../../../", relativePath),
  ];
  for (const file of candidates) {
    try {
      if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (err) {
      return { error: "invalid_json", file, detail: String(err), fallback };
    }
  }
  return fallback;
}

function sha256(value: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function accepted(req: Request, res: Response, kind: string) {
  const payload = req.body ?? {};
  res.json({ ok: true, version: "v31", kind, receivedAt: new Date().toISOString(), payloadHash: sha256(payload), status: payload.status ?? "received" });
}

export function registerProductionDryRunV31Routes(app: Express) {
  app.get("/api/ops/dry-run/v31/checklist", (_req, res) => {
    const checklist = readJson("data/deployment/production_dry_run_checklist_v31.json", { version: "v31", phases: [] });
    res.json({ ok: true, checklist });
  });

  app.get("/api/ops/dry-run/v31/readiness", (_req, res) => {
    const checklist: any = readJson("data/deployment/production_dry_run_checklist_v31.json", { phases: [] });
    const total = (checklist.phases ?? []).reduce((sum: number, phase: any) => sum + (phase.checks?.length ?? 0), 0);
    const blockers = [
      process.env.KNOWLEDGE_DATA_MODE === "db" ? null : "KNOWLEDGE_DATA_MODE must be db",
      process.env.NODE_ENV === "production" && process.env.DISABLE_PRODUCTION_STATIC_FALLBACK !== "true" ? "DISABLE_PRODUCTION_STATIC_FALLBACK must be true" : null,
      process.env.PINUYUMAYAN_HMAC_ENABLED === "true" ? null : "PINUYUMAYAN_HMAC_ENABLED must be true",
      process.env.DATABASE_URL ? null : "DATABASE_URL is missing"
    ].filter(Boolean);
    res.json({ ok: blockers.length === 0, version: "v31", totalChecklistItems: total, blockers, recommendation: blockers.length ? "block_cutover" : "ready_for_staging_evidence" });
  });

  app.post("/api/internal/dry-run/v31/report", (req, res) => accepted(req, res, "production_dry_run_report"));

  app.get("/api/ops/main-site/v31/migration-acceptance", (_req, res) => {
    const acceptance = readJson("data/integration/main_site_migration_acceptance_v31.json", { version: "v31", acceptance_tests: [] });
    res.json({ ok: true, acceptance });
  });
  app.post("/api/internal/main-site/v31/migration-report", (req, res) => accepted(req, res, "main_site_migration_report"));

  app.get("/api/ops/security/v31/hmac-route-coverage", (_req, res) => {
    const coverage = readJson("data/security/internal_hmac_route_coverage_v31.json", { version: "v31", coverage_matrix: [] });
    res.json({ ok: true, coverage });
  });
  app.post("/api/internal/security/v31/hmac-coverage-report", (req, res) => accepted(req, res, "hmac_route_coverage_report"));

  app.get("/api/admin/corpus/v31/backfill-status", (_req, res) => {
    const backfill = readJson("data/database/full_corpus_report_backfill_v31.json", { version: "v31" });
    const preview = readJson("data/deployment/production_dry_run_report_v31.preview.json", { actual_vps_run: false });
    res.json({ ok: true, backfill, preview });
  });
  app.post("/api/internal/corpus/v31/backfill-report", (req, res) => accepted(req, res, "corpus_backfill_report"));

  app.get("/api/admin/dashboard/v31/live-bindings", (_req, res) => {
    const bindings = readJson("data/admin/live_dashboard_binding_v31.json", { version: "v31", panels: [] });
    res.json({ ok: true, bindings });
  });

  app.get("/api/ops/search/v31/quality-suite", (_req, res) => {
    const suite = readJson("data/search/search_quality_v31.json", { version: "v31", queries: [] });
    res.json({ ok: true, suite });
  });
  app.post("/api/internal/search/v31/quality-report", (req, res) => accepted(req, res, "search_quality_report"));

  app.get("/api/ops/source-candidates/v31/intake-plan", (_req, res) => {
    const intake = readJson("data/sources/source_candidate_intake_v31.json", { version: "v31", candidate_sources: [] });
    res.json({ ok: true, intake });
  });

  app.get("/api/ops/next-upgrade-plan/v32", (_req, res) => {
    const plan = readJson("data/development/next_upgrade_plan_v32.json", { version: "v32", priorities: [] });
    res.json({ ok: true, plan });
  });
}
