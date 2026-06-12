import type { Express, Request, Response } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";

function readJson(relativePath: string, fallback: unknown) {
  const candidates = [path.resolve(process.cwd(), relativePath), path.resolve(process.cwd(), "..", relativePath), path.resolve(__dirname, "../../../", relativePath)];
  for (const file of candidates) {
    try { if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8")); } catch (err) { return { error: "invalid_json", file, detail: String(err), fallback }; }
  }
  return fallback;
}
function sha256(value: unknown) { return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
function accepted(req: Request, res: Response, kind: string) { const payload = req.body ?? {}; res.json({ ok: true, version: "v36", kind, payloadHash: sha256(payload), status: payload.status ?? "received", receivedAt: new Date().toISOString() }); }

export function registerMusicSongCatalogV36Routes(app: Express) {
  app.get("/api/ops/music-song/v36/source-registry", (_req, res) => res.json({ ok: true, registry: readJson("data/sources/music_song_source_registry_v36.json", { version: "v36" }) }));
  app.get("/api/ops/music-song/v36/catalog", (_req, res) => res.json({ ok: true, catalog: readJson("data/music/song_catalog_v36.json", { version: "v36", items: [] }) }));
  app.get("/api/ops/music-song/v36/search-config", (_req, res) => res.json({ ok: true, config: readJson("data/search/music_song_expanded_search_v36.json", { version: "v36" }) }));
  app.get("/api/ops/music-song/v36/review-queue", (_req, res) => res.json({ ok: true, queue: readJson("data/admin/music_song_review_queue_v36.json", { version: "v36", items: [] }) }));
  app.get("/api/ops/music-song/v36/rights-policy", (_req, res) => res.json({ ok: true, policy: readJson("data/security/music_song_rights_policy_v36.json", { version: "v36" }) }));
  app.get("/api/ops/music-song/v36/youtube-worker-contract", (_req, res) => res.json({ ok: true, contract: readJson("data/integration/youtube_song_metadata_worker_v36.json", { version: "v36" }) }));
  app.post("/api/internal/music-song/v36/ingestion-report", (req, res) => accepted(req, res, "music_song_ingestion_report_v36"));
  app.post("/api/internal/music-song/v36/review-report", (req, res) => accepted(req, res, "music_song_review_report_v36"));

  app.get("/api/public/true-knowledge/v36/music/cards", (_req, res) => res.json({ ok: true, cards: readJson("data/content/public_source_grounded_cards_v36.json", { version: "v36", cards: [] }) }));
  app.get("/api/public/true-knowledge/v36/music/search-documents", (_req, res) => res.json({ ok: true, documents: readJson("data/search/public_search_documents_v36.json", { version: "v36", documents: [] }) }));
  app.get("/api/public/true-knowledge/v36/music/claims", (_req, res) => res.json({ ok: true, claims: readJson("data/content/source_grounded_claims_v36_additions.json", { version: "v36", claims: [] }) }));
  app.get("/api/public/ai-article/v36/music-source-packets", (_req, res) => res.json({ ok: true, packets: readJson("data/ai/frontend_music_song_source_packets_v36.json", { version: "v36", packets: [] }) }));
  app.post("/api/internal/ai-article/v36/music-grounding-check", (req, res) => accepted(req, res, "music_song_grounding_check_v36"));
  app.get("/api/ops/next-upgrade-plan/v37", (_req, res) => res.json({ ok: true, plan: readJson("data/development/next_upgrade_plan_v37.json", { version: "v37" }) }));
}
