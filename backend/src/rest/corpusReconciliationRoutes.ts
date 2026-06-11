import type { Express } from "express";

export function registerCorpusReconciliationRoutes(app: Express) {
  app.get("/api/admin/corpus/reconciliation", (_req, res) => {
    res.json({ ok: true, version: "v15", status: "pending_full_import", expectedSourceCandidates: 66 });
  });
  app.post("/api/internal/corpus/reconcile/enqueue", (_req, res) => {
    res.status(202).json({ ok: true, accepted: true, jobId: `corpus_reconcile_${Date.now()}` });
  });
}
