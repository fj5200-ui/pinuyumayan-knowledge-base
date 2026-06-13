import { ok } from "../lib/apiResponse";
import { requireInternalApiKey } from "../security/apiKeyAuth";
import { createContext } from "../trpc/context";
import { getContentItemBySlug, listContentCollections, listVocabularyLearningSets } from "../modules/content/service";
function asyncRoute(handler) {
    return (req, res, next) => handler(req, res).catch(next);
}
export function registerContentRoutes(app) {
    app.get("/api/public/content/collections", asyncRoute(async (req, res) => {
        const ctx = await createContext();
        const data = await listContentCollections(ctx.db, String(req.query.channel ?? "public"));
        ok(res, data);
    }));
    app.get("/api/public/content/items/:slug", asyncRoute(async (req, res) => {
        const ctx = await createContext();
        const data = await getContentItemBySlug(ctx.db, req.params.slug);
        ok(res, data, data.ok ? 200 : 404);
    }));
    app.get("/api/public/content/learning-sets", asyncRoute(async (_req, res) => {
        ok(res, await listVocabularyLearningSets());
    }));
    app.post("/api/internal/content/rebuild-collections", requireInternalApiKey, (_req, res) => {
        ok(res, { status: "queued", jobType: "content_collection_rebuild", implementedIn: "v16", note: "Production worker should regenerate public_knowledge_cards_v16 and search docs from approved records." });
    });
}
