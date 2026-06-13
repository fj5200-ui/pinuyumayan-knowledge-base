import { getForbiddenRelationPolicy, listV21Cards, listV21Claims, listV21FrontendSourcePackets, validateBlockedRelations } from '../modules/trueKnowledgeV21/service';
export function registerTrueKnowledgeV21Routes(app) {
    app.get('/api/public/true-knowledge/v21/claims', (_req, res) => res.json({ version: 'v21', claims: listV21Claims() }));
    app.get('/api/public/true-knowledge/v21/cards', (_req, res) => res.json({ version: 'v21', cards: listV21Cards() }));
    app.get('/api/public/ai-article/v21/source-packets', (_req, res) => res.json({ version: 'v21', packets: listV21FrontendSourcePackets() }));
    app.get('/api/public/knowledge/forbidden-relations/v21', (_req, res) => res.json(getForbiddenRelationPolicy()));
    app.post('/api/internal/ai-article/v21/blocked-relation-check', (req, res) => res.json(validateBlockedRelations(req.body ?? {})));
}
