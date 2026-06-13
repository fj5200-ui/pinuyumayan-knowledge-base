import { suggestKnowledgeTerms } from "../modules/search/service";
export function registerSearchRoutes(app) {
    app.get("/api/public/search/suggest", async (req, res) => {
        const q = String(req.query.q ?? "");
        res.json({ ok: true, data: await suggestKnowledgeTerms(q) });
    });
    app.get("/api/public/search/facets", async (_req, res) => {
        res.json({ ok: true, data: { facets: ["entity_type", "community_key", "dialect_code", "category", "release_channel"] } });
    });
}
