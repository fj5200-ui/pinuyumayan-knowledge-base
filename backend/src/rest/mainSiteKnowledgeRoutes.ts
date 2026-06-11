import type { Express, Request, Response, NextFunction } from "express";
import type { createContext } from "../trpc/context";
import { publicCache, privateNoStore, requireMainSiteApiKey } from "../security/mainSiteAuth";
import {
  getBootstrapData,
  getCommunityProfile,
  getDeltaSince,
  getKnowledgeBundle,
  getRelatedKnowledge,
  listVocabularyAudio,
  searchPublicKnowledge
} from "../modules/mainSiteKnowledge/service";

type ContextFactory = typeof createContext;

function asyncRoute(handler: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).catch(next);
  };
}

export function registerMainSiteKnowledgeRoutes(app: Express, createContextFn: ContextFactory) {
  app.get("/api/public/knowledge/bootstrap", publicCache(300), asyncRoute(async (_req, res) => {
    const ctx = await createContextFn();
    res.json(await getBootstrapData(ctx.db));
  }));

  app.get("/api/public/knowledge/search", publicCache(120, 3600), asyncRoute(async (req, res) => {
    const ctx = await createContextFn();
    res.json(await searchPublicKnowledge(ctx.db, {
      q: String(req.query.q ?? ""),
      limit: Number(req.query.limit ?? 20),
      entityTypes: typeof req.query.entityTypes === "string" ? req.query.entityTypes.split(",") : undefined
    }));
  }));

  app.get("/api/public/knowledge/related", publicCache(300), asyncRoute(async (req, res) => {
    const ctx = await createContextFn();
    res.json(await getRelatedKnowledge(ctx.db, {
      entityType: String(req.query.entityType ?? ""),
      entityId: String(req.query.entityId ?? ""),
      limit: Number(req.query.limit ?? 12)
    }));
  }));

  app.get("/api/public/knowledge/communities/:communityKey", publicCache(600), asyncRoute(async (req, res) => {
    const ctx = await createContextFn();
    res.json(await getCommunityProfile(ctx.db, req.params.communityKey));
  }));

  app.get("/api/public/knowledge/vocabulary", publicCache(300), asyncRoute(async (req, res) => {
    const ctx = await createContextFn();
    res.json(await listVocabularyAudio(ctx.db, {
      dialectCode: typeof req.query.dialectCode === "string" ? req.query.dialectCode : undefined,
      categoryKey: typeof req.query.categoryKey === "string" ? req.query.categoryKey : undefined,
      q: typeof req.query.q === "string" ? req.query.q : undefined,
      limit: Number(req.query.limit ?? 20)
    }));
  }));

  app.get("/api/internal/main-site/knowledge/bundle", requireMainSiteApiKey, privateNoStore, asyncRoute(async (req, res) => {
    const ctx = await createContextFn();
    res.json(await getKnowledgeBundle(ctx.db, {
      includeVocabulary: req.query.includeVocabulary !== "false",
      vocabularyLimit: Number(req.query.vocabularyLimit ?? 80)
    }));
  }));

  app.get("/api/internal/main-site/knowledge/delta", requireMainSiteApiKey, privateNoStore, asyncRoute(async (req, res) => {
    const ctx = await createContextFn();
    res.json(await getDeltaSince(ctx.db, {
      since: String(req.query.since ?? new Date(0).toISOString()),
      limit: Number(req.query.limit ?? 100)
    }));
  }));
}
