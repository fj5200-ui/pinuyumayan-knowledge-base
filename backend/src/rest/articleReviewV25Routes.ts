import type { Express } from "express";
import { getReviewWorkbenchV25, applyReviewActionV25, runSeoPublishCheckV25 } from "../modules/articleReviewV25/service";
import { verifyPinuyumayanHmacV25 } from "../security/hmacGuardV25";

export function registerArticleReviewV25Routes(app: Express) {
  app.get("/api/admin/articles/v25/review-workbench", (_req, res) => res.json(getReviewWorkbenchV25()));

  app.post("/api/admin/articles/v25/review-action", (req, res) => res.json(applyReviewActionV25(req.body ?? {})));

  app.post("/api/internal/articles/v25/publish-seo-check", (req, res) => {
    const hmac = verifyPinuyumayanHmacV25(req);
    if (!hmac.ok) return res.status(401).json({ ok: false, error: { code: hmac.failureCode, message: "Invalid internal API signature" } });
    res.json(runSeoPublishCheckV25(req.body ?? {}));
  });

  app.post("/api/internal/security/v25/verify-hmac", (req, res) => {
    const hmac = verifyPinuyumayanHmacV25(req);
    res.status(hmac.ok ? 200 : 401).json({ ok: hmac.ok, version: "v25", failureCode: hmac.failureCode ?? null });
  });

  app.get("/api/ops/security/v25/hmac-failures", (_req, res) => {
    res.json({ version: "v25", note: "Wire this route to internal_hmac_failures_v25 for production dashboards.", failures: [] });
  });
}
