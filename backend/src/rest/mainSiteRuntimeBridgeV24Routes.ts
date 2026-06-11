import type { Express } from "express";
import { getMainSiteRuntimeStatusV24, validateClientDraftV24 } from "../modules/mainSiteRuntimeV24/service";

export function registerMainSiteRuntimeBridgeV24Routes(app: Express) {
  app.get("/api/ops/main-site/v24/connection-check", (_req, res) => {
    res.json(getMainSiteRuntimeStatusV24());
  });

  app.post("/api/internal/ai-article/v24/client-draft/validate", (req, res) => {
    res.json(validateClientDraftV24(req.body?.draft ?? req.body));
  });

  app.post("/api/internal/ai-article/v24/client-draft/submit-review", (req, res) => {
    res.json({ ok: true, status: "submitted_to_review_queue", version: "v24", draftId: req.body?.draftId ?? null });
  });

  app.get("/api/admin/articles/v24/review-workbench", (_req, res) => {
    res.json({ version: "v24", queues: ["needs_citation_fix", "duplicate_review", "forbidden_relation_review", "ready_to_schedule"] });
  });

  app.post("/api/internal/articles/v24/schedule", (req, res) => {
    res.json({ ok: true, status: "scheduled_pending_final_checks", draftId: req.body?.draftId ?? null });
  });
}
