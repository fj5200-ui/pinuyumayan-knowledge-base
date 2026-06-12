import type { Express, Request, Response } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";

function readJson(relativePath: string, fallback: unknown) {
  const candidates = [
    path.resolve(process.cwd(), relativePath),
    path.resolve(process.cwd(), "..", relativePath),
    path.resolve(__dirname, "../../../", relativePath),
  ];
  for (const file of candidates) {
    try { if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8")); } catch (err) { return { error: "invalid_json", file, detail: String(err), fallback }; }
  }
  return fallback;
}
function sha256(value: unknown) { return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
function accepted(req: Request, res: Response, kind: string) { const payload = req.body ?? {}; res.json({ ok: true, version: "v34", kind, payloadHash: sha256(payload), status: payload.status ?? "received", receivedAt: new Date().toISOString() }); }

export function registerExpandedTrueKnowledgeV34Routes(app: Express) {
  app.get("/api/ops/source-search/v34/expanded-plan", (_req, res) => res.json({ ok: true, plan: readJson("data/sources/expanded_source_search_plan_v34.json", { version: "v34" }) }));
  app.get("/api/ops/source-search/v34/worker-contract", (_req, res) => res.json({ ok: true, contract: readJson("data/sources/source_harvest_worker_contract_v34.json", { version: "v34" }) }));
  app.get("/api/ops/source-search/v34/candidates", (_req, res) => res.json({ ok: true, candidates: readJson("data/admin/source_candidate_review_queue_v34.json", { version: "v34" }) }));
  app.post("/api/internal/source-search/v34/ingestion-report", (req, res) => accepted(req, res, "source_search_ingestion_report_v34"));
  app.post("/api/internal/source-search/v34/candidate-review-report", (req, res) => accepted(req, res, "source_candidate_review_report_v34"));

  app.get("/api/public/true-knowledge/v34/cards", (_req, res) => res.json({ ok: true, cards: readJson("data/content/public_source_grounded_cards_v34.json", { version: "v34", cards: [] }) }));
  app.get("/api/public/true-knowledge/v34/search-documents", (_req, res) => res.json({ ok: true, documents: readJson("data/search/public_search_documents_v34.json", { version: "v34", documents: [] }) }));
  app.get("/api/public/true-knowledge/v34/claims", (_req, res) => res.json({ ok: true, claims: readJson("data/content/source_grounded_claims_v34_additions.json", { version: "v34", claims: [] }) }));
  app.get("/api/public/ai-article/v34/source-packets", (_req, res) => res.json({ ok: true, packets: readJson("data/ai/frontend_source_packets_v34.json", { version: "v34", packets: [] }) }));
  app.post("/api/internal/ai-article/v34/source-grounding-check", (req, res) => accepted(req, res, "ai_article_source_grounding_check_v34"));

  app.get("/api/admin/true-knowledge/v34/review-queue", (_req, res) => res.json({ ok: true, queue: readJson("data/admin/source_candidate_review_queue_v34.json", { version: "v34" }) }));
  app.get("/api/ops/forbidden-relations/v34/audit", (_req, res) => res.json({ ok: true, forbidden: readJson("data/security/forbidden_knowledge_relations_v34.json", { version: "v34" }) }));
  app.get("/api/ops/search/v34/config", (_req, res) => res.json({ ok: true, config: readJson("data/search/expanded_search_config_v34.json", { version: "v34" }) }));
  app.get("/api/ops/next-upgrade-plan/v35", (_req, res) => res.json({ ok: true, plan: readJson("data/development/next_upgrade_plan_v35.json", { version: "v35" }) }));
}
