import crypto from "crypto";
import fs from "fs";
import path from "path";
function readJson(relativePath, fallback) {
    const candidates = [
        path.resolve(process.cwd(), relativePath),
        path.resolve(process.cwd(), "..", relativePath),
        path.resolve(__dirname, "../../../", relativePath),
    ];
    for (const file of candidates) {
        try {
            if (fs.existsSync(file))
                return JSON.parse(fs.readFileSync(file, "utf8"));
        }
        catch (err) {
            return { error: "invalid_json", file, detail: String(err), fallback };
        }
    }
    return fallback;
}
function sha256(value) { return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
function accepted(req, res, kind) { const payload = req.body ?? {}; res.json({ ok: true, version: "v33", kind, payloadHash: sha256(payload), status: payload.status ?? "received", receivedAt: new Date().toISOString() }); }
export function registerExpandedSourceSearchV33Routes(app) {
    app.get("/api/ops/source-search/v33/expanded-plan", (_req, res) => res.json({ ok: true, plan: readJson("data/sources/expanded_source_search_plan_v33.json", { version: "v33" }) }));
    app.get("/api/ops/source-search/v33/candidates", (_req, res) => res.json({ ok: true, candidates: readJson("data/admin/source_candidate_review_queue_v33.json", { version: "v33" }) }));
    app.post("/api/internal/source-search/v33/ingestion-report", (req, res) => accepted(req, res, "source_search_ingestion_report"));
    app.get("/api/public/true-knowledge/v33/cards", (_req, res) => res.json({ ok: true, cards: readJson("data/content/public_source_grounded_cards_v33.json", { version: "v33", cards: [] }) }));
    app.get("/api/public/true-knowledge/v33/search-documents", (_req, res) => res.json({ ok: true, documents: readJson("data/search/public_search_documents_v33.json", { version: "v33", documents: [] }) }));
    app.get("/api/public/ai-article/v33/source-packets", (_req, res) => res.json({ ok: true, packets: readJson("data/ai/frontend_source_packets_v33.json", { version: "v33", packets: [] }) }));
    app.post("/api/internal/ai-article/v33/source-grounding-check", (req, res) => accepted(req, res, "source_grounding_check"));
    app.get("/api/admin/true-knowledge/v33/review-queue", (_req, res) => res.json({ ok: true, queue: readJson("data/admin/source_candidate_review_queue_v33.json", { version: "v33" }) }));
    app.get("/api/ops/forbidden-relations/v33/audit", (_req, res) => res.json({ ok: true, policy: readJson("data/security/forbidden_knowledge_relations_v33.json", { version: "v33" }) }));
    app.get("/api/ops/next-upgrade-plan/v34", (_req, res) => res.json({ ok: true, plan: readJson("data/development/next_upgrade_plan_v34.json", { version: "v34", priorities: [] }) }));
}
