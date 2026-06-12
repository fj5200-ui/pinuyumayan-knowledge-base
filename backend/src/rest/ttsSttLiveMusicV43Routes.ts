import type { Express } from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
function rootDir() { return process.cwd().endsWith("backend") ? path.resolve(process.cwd(), "..") : process.cwd(); }
function readJson(rel: string) { return JSON.parse(fs.readFileSync(path.join(rootDir(), rel), "utf8")); }
function sha(input: unknown) { return crypto.createHash("sha256").update(JSON.stringify(input ?? {})).digest("hex"); }
const blockedTerms = ["卑南文化遺址", "卑南遺址", "卑南考古遺址", "卑南文化公園", "卑南遺址公園", "Peinan Site", "Beinan Site", "Peinan Archaeological Site"];
const lyricPatterns = /(完整歌詞|逐字歌詞|歌詞全文|仿古調|模仿古調|下載音訊|下載影片|訓練歌聲|歌聲模型|YouTube音源訓練|未授權音源訓練)/;
function guardPayload(body: unknown) { const text = JSON.stringify(body ?? {}); const blocked = blockedTerms.filter((term) => text.includes(term)); const lyricsRisk = lyricPatterns.test(text); const hasClaims = /claim_ids|claimIds/.test(text); const hasSources = /source_ids|sourceIds/.test(text); return { ok: blocked.length === 0 && !lyricsRisk && hasClaims && hasSources, blocked, lyricsRisk, hasClaims, hasSources, hash: sha(body) }; }
export function registerTtsSttLiveMusicV43Routes(app: Express) {
  app.get("/api/ops/speech-training/v43/authorized-review", (_req, res) => res.json(readJson("data/audio/authorized_speech_review_v43.json")));
  app.get("/api/ops/speech-training/v43/model-workspace", (_req, res) => res.json(readJson("data/audio/model_experiment_workspace_v43.json")));
  app.get("/api/ops/speech-training/v43/evaluation-dashboard", (_req, res) => res.json(readJson("data/audio/mos_wer_cer_dashboard_v43.json")));
  app.get("/api/ops/speech-training/v43/release-gate", (_req, res) => res.json(readJson("data/security/speech_release_gate_v43.json")));
  app.get("/api/admin/speech-training/v43/review-queue", (_req, res) => res.json(readJson("data/audio/authorized_speech_review_v43.json")));
  app.post("/api/internal/speech-training/v43/authorization-report", (req, res) => res.json({ ok: true, accepted: true, version: "v43", report_hash: sha(req.body), db_table: "speech_authorization_reviews_v43", received: req.body ?? {} }));
  app.post("/api/internal/speech-training/v43/model-experiment-report", (req, res) => res.json({ ok: true, accepted: true, version: "v43", report_hash: sha(req.body), public_release_allowed: false, db_table: "speech_model_experiments_v43" }));
  app.post("/api/internal/speech-training/v43/evaluation-report", (req, res) => { const b = req.body ?? {}; const mos = Number(b.mos ?? 0); const wer = Number(b.wer ?? 1); const cer = Number(b.cer ?? 1); const passed = (b.model_type === "tts" && mos >= 4.0) || (b.model_type === "stt" && wer <= 0.25 && cer <= 0.15); res.json({ ok: true, accepted: true, version: "v43", report_hash: sha(b), metric_gate_passed: passed, public_release_allowed: false, db_table: "speech_evaluation_reports_v43" }); });
  app.get("/api/ops/search/music/v43/live-db-config", (_req, res) => res.json(readJson("data/search/music_live_db_query_v43.json")));
  app.get("/api/public/search/music/v43", (req, res) => { const q = String(req.query.q ?? "").trim(); const blocked = blockedTerms.filter((term) => q.includes(term)); if (blocked.length) return res.status(400).json({ ok: false, error: "forbidden_relation_query", blocked_terms: blocked }); const docs = readJson("data/search/public_search_documents_v43.json").documents ?? []; const hits = q ? docs.filter((d: any) => JSON.stringify(d).toLowerCase().includes(q.toLowerCase())).slice(0, Number(req.query.limit ?? 20)) : docs.slice(0, Number(req.query.limit ?? 20)); res.json({ ok: true, version: "v43", query: q, count: hits.length, hits, mode: "json_preview_db_contract", facets: readJson("data/search/music_live_db_query_v43.json").facets }); });
  app.post("/api/internal/search/music/v43/live-db-report", (req, res) => res.json({ ok: true, accepted: true, version: "v43", report_hash: sha(req.body), db_table: "music_search_live_queries_v43" }));
  app.get("/api/ops/authority-sources/v43/live-fetch-contract", (_req, res) => res.json(readJson("data/integration/authority_source_live_fetch_v43.json")));
  app.post("/api/internal/authority-sources/v43/live-fetch-report", (req, res) => { const text = JSON.stringify(req.body ?? {}); const blocked = blockedTerms.filter((term) => text.includes(term)); res.json({ ok: blocked.length === 0, accepted: blocked.length === 0, version: "v43", blocked_terms: blocked, report_hash: sha(req.body), db_tables: ["authority_source_fetch_runs_v43", "authority_source_candidates_v43"] }); });
  app.get("/api/admin/music-speech/v43/dashboard", (_req, res) => res.json(readJson("data/admin/tts_stt_music_dashboard_v43.json")));
  app.get("/api/public/true-knowledge/v43/music/cards", (_req, res) => res.json(readJson("data/content/public_source_grounded_cards_v43.json")));
  app.get("/api/public/true-knowledge/v43/music/search-documents", (_req, res) => res.json(readJson("data/search/public_search_documents_v43.json")));
  app.get("/api/public/true-knowledge/v43/music/claims", (_req, res) => res.json(readJson("data/content/source_grounded_claims_v43_additions.json")));
  app.get("/api/public/ai-article/v43/music-speech-source-packets", (_req, res) => res.json(readJson("data/ai/frontend_music_speech_source_packets_v43.json")));
  app.post("/api/internal/ai-article/v43/music-speech-grounding-check", (req, res) => { const result = guardPayload(req.body); res.json({ ok: result.ok, accepted: result.ok, version: "v43", draft_hash: result.hash, blocked_terms: result.blocked, lyrics_risk: result.lyricsRisk, has_claims: result.hasClaims, has_sources: result.hasSources }); });
  app.get("/api/ops/next-upgrade-plan/v44", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v44.json")));
}
