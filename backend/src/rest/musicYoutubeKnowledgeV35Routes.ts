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
function accepted(req: Request, res: Response, kind: string) { const payload = req.body ?? {}; res.json({ ok: true, version: "v35", kind, payloadHash: sha256(payload), status: payload.status ?? "received", receivedAt: new Date().toISOString() }); }

export function registerMusicYoutubeKnowledgeV35Routes(app: Express) {
  app.get("/api/ops/music-youtube/v35/source-registry", (_req, res) => res.json({ ok: true, registry: readJson("data/sources/music_youtube_source_registry_v35.json", { version: "v35" }) }));
  app.get("/api/ops/music-youtube/v35/search-config", (_req, res) => res.json({ ok: true, config: readJson("data/search/music_youtube_expanded_search_v35.json", { version: "v35" }) }));
  app.get("/api/ops/music-youtube/v35/review-queue", (_req, res) => res.json({ ok: true, queue: readJson("data/admin/music_youtube_review_queue_v35.json", { version: "v35", items: [] }) }));
  app.post("/api/internal/music-youtube/v35/ingestion-report", (req, res) => accepted(req, res, "music_youtube_ingestion_report_v35"));
  app.post("/api/internal/music-youtube/v35/review-report", (req, res) => accepted(req, res, "music_youtube_review_report_v35"));

  app.get("/api/public/true-knowledge/v35/music/cards", (_req, res) => res.json({ ok: true, cards: readJson("data/content/public_source_grounded_cards_v35.json", { version: "v35", cards: [] }) }));
  app.get("/api/public/true-knowledge/v35/music/search-documents", (_req, res) => res.json({ ok: true, documents: readJson("data/search/public_search_documents_v35.json", { version: "v35", documents: [] }) }));
  app.get("/api/public/true-knowledge/v35/music/claims", (_req, res) => res.json({ ok: true, claims: readJson("data/content/source_grounded_claims_v35_additions.json", { version: "v35", claims: [] }) }));
  app.get("/api/public/ai-article/v35/music-source-packets", (_req, res) => res.json({ ok: true, packets: readJson("data/ai/frontend_music_source_packets_v35.json", { version: "v35", packets: [] }) }));

  app.get("/api/ops/music-youtube/v35/rights-policy", (_req, res) => res.json({ ok: true, policy: readJson("data/security/music_rights_policy_v35.json", { version: "v35" }) }));
  app.post("/api/internal/ai-article/v35/music-grounding-check", (req, res) => accepted(req, res, "music_grounding_check_v35"));
  app.get("/api/ops/next-upgrade-plan/v36", (_req, res) => res.json({ ok: true, plan: readJson("data/development/next_upgrade_plan_v36.json", { version: "v36" }) }));
}
