import type { Express, Request, Response, NextFunction } from "express";
import { ok, fail } from "../lib/apiResponse";
import { requireInternalApiKey } from "../security/apiKeyAuth";
import { buildDraftPlan, duplicateCheck, listArticleBlueprints, listSourcePackets, publishCheck } from "../modules/aiArticle/service";

function asyncRoute(handler: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => handler(req, res).catch(next);
}

export function registerAiArticleRoutes(app: Express) {
  app.get("/api/public/ai-article/source-packets", asyncRoute(async (req, res) => {
    ok(res, await listSourcePackets(String(req.query.topic ?? "")));
  }));

  app.get("/api/public/ai-article/blueprints", asyncRoute(async (_req, res) => {
    ok(res, await listArticleBlueprints());
  }));

  app.post("/api/internal/ai-article/draft-plan", requireInternalApiKey, asyncRoute(async (req, res) => {
    const result = await buildDraftPlan({
      blueprintId: String(req.body?.blueprintId ?? ""),
      idea: typeof req.body?.idea === "string" ? req.body.idea : undefined,
      preferredTitle: typeof req.body?.preferredTitle === "string" ? req.body.preferredTitle : undefined
    });
    if (!result.ok) return fail(res, 404, result.error.code, result.error.message);
    ok(res, result);
  }));

  app.post("/api/internal/ai-article/duplicate-check", requireInternalApiKey, (req, res) => {
    ok(res, duplicateCheck({
      title: String(req.body?.title ?? ""),
      slug: String(req.body?.slug ?? ""),
      sourceClaimIds: Array.isArray(req.body?.sourceClaimIds) ? req.body.sourceClaimIds.map(String) : [],
      existingFingerprints: Array.isArray(req.body?.existingFingerprints) ? req.body.existingFingerprints.map(String) : []
    }));
  });

  app.post("/api/internal/ai-article/publish-check", requireInternalApiKey, (req, res) => {
    ok(res, publishCheck({ draftPlan: req.body?.draftPlan }));
  });

  app.get("/api/admin/ai-article/review-queue", requireInternalApiKey, (_req, res) => {
    ok(res, {
      status: "ready",
      queue: "article_review_queue_v18",
      reviewRequired: true,
      note: "Use this endpoint to connect the admin UI to draft plans that passed duplicate/citation checks."
    });
  });
}
