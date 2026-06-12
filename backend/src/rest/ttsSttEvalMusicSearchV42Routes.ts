import type { Express } from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
function rootDir() { return process.cwd().endsWith("backend") ? path.resolve(process.cwd(), "..") : process.cwd(); }
function readJson(rel: string) { return JSON.parse(fs.readFileSync(path.join(rootDir(), rel), "utf8")); }
function sha(input: unknown) { return crypto.createHash("sha256").update(JSON.stringify(input ?? {})).digest("hex"); }
const blockedTerms = ["卑南文化遺址", "卑南遺址", "卑南考古遺址", "卑南文化公園", "卑南遺址公園", "Peinan Site", "Beinan Site", "Peinan Archaeological Site"];
const lyricPatterns = /(完整歌詞|逐字歌詞|歌詞全文|仿古調|模仿古調|下載音訊|下載影片|訓練歌聲|歌聲模型|YouTube音源訓練|未授權音源訓練)/;
function guardPayload(body: unknown) {
  const text = JSON.stringify(body ?? {});
  const blocked = blockedTerms.filter((term) => text.includes(term));
  const lyricsRisk = lyricPatterns.test(text);
  const hasClaims = /claim_ids|claimIds/.test(text);
  const hasSources = /source_ids|sourceIds/.test(text);
  return { ok: blocked.length === 0 && !lyricsRisk && hasClaims && hasSources, blocked, lyricsRisk, hasClaims, hasSources, hash: sha(body) };
}
export function registerTtsSttEvalMusicSearchV42Routes(app: Express) {
  app.get("/api/ops/speech-training/v42/authorized-review", (_req, res) => res.json(readJson("data/audio/tts_stt_authorized_dataset_review_v42.json")));
  app.get("/api/ops/speech-training/v42/dataset-split", (_req, res) => res.json(readJson("data/audio/tts_stt_dataset_split_v42.json")));
  app.get("/api/ops/speech-training/v42/evaluation-schema", (_req, res) => res.json(readJson("data/audio/tts_stt_evaluation_report_schema_v42.json")));
  app.get("/api/admin/speech-training/v42/review-queue", (_req, res) => res.json(readJson("data/audio/speech_alignment_review_queue_v42.json")));
  app.post("/api/internal/speech-training/v42/dataset-review-report", (req, res) => res.json({ ok: true, accepted: true, version: "v42", report_hash: sha(req.body), db_table: "speech_dataset_review_reports_v42", received: req.body ?? {} }));
  app.post("/api/internal/speech-training/v42/evaluation-report", (req, res) => {
    const body = req.body ?? {};
    const mos = Number(body.mos ?? 0);
    const cer = Number(body.cer ?? 1);
    const publicAllowed = mos >= 4.0 && cer <= 0.15 && body.human_review_required !== false && body.license_review_required !== false;
    res.json({ ok: true, accepted: true, version: "v42", report_hash: sha(body), public_release_allowed: publicAllowed, required_gate: { tts_mos_min: 4.0, stt_cer_max: 0.15, human_review_required: true, license_review_required: true }, db_table: "speech_evaluation_reports_v42" });
  });

  app.get("/api/ops/search/music/v42/config", (_req, res) => res.json(readJson("data/search/public_music_search_api_v42.json")));
  app.get("/api/public/search/music", (req, res) => {
    const q = String(req.query.q ?? "").trim();
    const blocked = blockedTerms.filter((term) => q.includes(term));
    if (blocked.length) return res.status(400).json({ ok: false, error: "forbidden_relation_query", blocked_terms: blocked });
    const docs = readJson("data/search/public_search_documents_v42.json").documents ?? [];
    const hits = q ? docs.filter((d: any) => JSON.stringify(d).toLowerCase().includes(q.toLowerCase())).slice(0, Number(req.query.limit ?? 20)) : docs.slice(0, Number(req.query.limit ?? 20));
    res.json({ ok: true, query: q, count: hits.length, hits, facets: ["artist", "community", "work_type", "rights_status", "sensitivity", "source_authority"] });
  });
  app.post("/api/internal/search/music/v42/populate-fulltext", (req, res) => res.json({ ok: true, accepted: true, version: "v42", report_hash: sha(req.body), db_table: "music_fulltext_population_runs_v42", received: req.body ?? {} }));

  app.get("/api/ops/authority-sources/v42/worker-contract", (_req, res) => res.json(readJson("data/integration/authority_source_fetch_worker_v42.json")));
  app.post("/api/internal/authority-sources/v42/fetch-report", (req, res) => {
    const text = JSON.stringify(req.body ?? {});
    const blocked = blockedTerms.filter((term) => text.includes(term));
    res.json({ ok: blocked.length === 0, accepted: blocked.length === 0, version: "v42", report_hash: sha(req.body), blocked_terms: blocked, db_table: "authority_source_fetch_runs_v42" });
  });
  app.get("/api/admin/music-speech/v42/live-dashboard", (_req, res) => res.json(readJson("data/admin/music_speech_live_db_dashboard_v42.json")));
  app.get("/api/ops/music-speech/v42/db-transaction-schema", (_req, res) => res.json(readJson("data/database/vps_tts_stt_transaction_schema_v42.json")));
  app.get("/api/ops/music-speech/v42/ai-guardrails", (_req, res) => res.json(readJson("data/security/ai_music_speech_guardrails_v42.json")));

  app.get("/api/public/true-knowledge/v42/music/cards", (_req, res) => res.json(readJson("data/content/public_source_grounded_cards_v42.json")));
  app.get("/api/public/true-knowledge/v42/music/search-documents", (_req, res) => res.json(readJson("data/search/public_search_documents_v42.json")));
  app.get("/api/public/true-knowledge/v42/music/claims", (_req, res) => res.json(readJson("data/content/source_grounded_claims_v42_additions.json")));
  app.get("/api/public/ai-article/v42/music-speech-source-packets", (_req, res) => res.json(readJson("data/ai/frontend_music_speech_source_packets_v42.json")));
  app.post("/api/internal/ai-article/v42/music-speech-grounding-check", (req, res) => {
    const result = guardPayload(req.body);
    res.json({ ok: result.ok, accepted: result.ok, version: "v42", draft_hash: result.hash, blocked_terms: result.blocked, lyrics_risk: result.lyricsRisk, has_claims: result.hasClaims, has_sources: result.hasSources, required: ["claim_ids", "source_ids", "no_full_lyrics", "no_audio_download", "no_unlicensed_training"] });
  });
  app.get("/api/ops/next-upgrade-plan/v43", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v43.json")));
}
