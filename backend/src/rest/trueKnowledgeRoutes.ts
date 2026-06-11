import type { Express, Request, Response } from 'express';
import {
  listTrueKnowledgeSourcesV20,
  listTrueKnowledgeClaimsV20,
  listFrontendSourcePacketsV20,
  getNextUpgradePlanV21,
  checkDraftDuplicateV20,
} from '../modules/trueKnowledge/service';

export function registerTrueKnowledgeRoutes(app: Express) {
  app.get('/api/public/true-knowledge/v20/sources', async (_req: Request, res: Response) => {
    res.json(await listTrueKnowledgeSourcesV20());
  });

  app.get('/api/public/true-knowledge/v20/claims', async (_req: Request, res: Response) => {
    res.json(await listTrueKnowledgeClaimsV20());
  });

  app.get('/api/public/true-knowledge/v20/source-packets', async (_req: Request, res: Response) => {
    res.json(await listFrontendSourcePacketsV20());
  });

  app.post('/api/internal/true-knowledge/v20/deduplicate', async (req: Request, res: Response) => {
    res.json(checkDraftDuplicateV20(req.body || {}));
  });

  app.get('/api/ops/next-upgrade-plan', async (_req: Request, res: Response) => {
    res.json(await getNextUpgradePlanV21());
  });
}
