import type { Express } from "express";

export function registerObservabilityRoutes(app: Express) {
  app.get("/api/ops/slo", (_req, res) => {
    res.json({ ok: true, version: "v15", endpoints: ["public_bootstrap", "public_vocabulary", "internal_delta"] });
  });
  app.get("/api/ops/observability-dashboard", (_req, res) => {
    res.json({ ok: true, version: "v15", dashboards: ["main_site_delivery", "full_corpus_import", "security_ops", "search_quality"] });
  });
}
