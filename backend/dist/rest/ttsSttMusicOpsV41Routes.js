import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
function rootDir() { return process.cwd().endsWith("backend") ? path.resolve(process.cwd(), "..") : process.cwd(); }
function readJson(rel) { return JSON.parse(fs.readFileSync(path.join(rootDir(), rel), "utf8")); }
function sha(input) { return crypto.createHash("sha256").update(JSON.stringify(input ?? {})).digest("hex"); }
const blockedTerms = ["卑南文化遺址", "卑南遺址", "卑南考古遺址", "卑南文化公園", "卑南遺址公園", "Peinan Site", "Beinan Site", "Peinan Archaeological Site"];
const lyricPatterns = /(完整歌詞|逐字歌詞|歌詞全文|仿古調|模仿古調|下載音訊|下載影片|訓練歌聲|歌聲模型|YouTube音源訓練)/;
export function registerTtsSttMusicOpsV41Routes(app) {
    app.get("/api/ops/speech-training/v41/policy", (_req, res) => res.json(readJson("data/audio/tts_stt_training_policy_v41.json")));
    app.get("/api/ops/speech-training/v41/manifest", (_req, res) => res.json(readJson("data/audio/tts_stt_training_manifest_v41.json")));
    app.get("/api/ops/speech-training/v41/quality-gate", (_req, res) => res.json(readJson("data/audio/tts_stt_quality_gate_v41.json")));
    app.post("/api/internal/speech-training/v41/dataset-report", (req, res) => res.json({ ok: true, accepted: true, version: "v41", report_hash: sha(req.body), db_transaction: "required_on_vps", received: req.body ?? {} }));
    app.get("/api/ops/music-folk-song/v41/source-registry", (_req, res) => res.json(readJson("data/sources/tts_stt_music_source_registry_v41.json")));
    app.get("/api/ops/music-folk-song/v41/catalog", (_req, res) => res.json(readJson("data/music/folk_song_tts_stt_expansion_v41.json")));
    app.get("/api/ops/music-folk-song/v41/review-ui", (_req, res) => res.json(readJson("data/admin/music_review_ui_v41.json")));
    app.get("/api/ops/music-folk-song/v41/review-queue", (_req, res) => res.json(readJson("data/admin/music_tts_stt_review_queue_v41.json")));
    app.get("/api/ops/music-folk-song/v41/youtube-worker-contract", (_req, res) => res.json(readJson("data/integration/youtube_data_api_worker_v41.json")));
    app.get("/api/ops/music-folk-song/v41/authority-adapters", (_req, res) => res.json(readJson("data/integration/authority_music_source_adapters_v41.json")));
    app.get("/api/ops/music-folk-song/v41/fulltext-config", (_req, res) => res.json(readJson("data/search/mysql_fulltext_music_index_v41.json")));
    app.get("/api/ops/music-folk-song/v41/ai-guardrails", (_req, res) => res.json(readJson("data/security/ai_music_guardrails_v41.json")));
    app.get("/api/ops/music-folk-song/v41/db-transaction-contract", (_req, res) => res.json(readJson("data/database/vps_music_transaction_contract_v41.json")));
    app.post("/api/internal/music-folk-song/v41/ingestion-report", (req, res) => res.json({ ok: true, accepted: true, version: "v41", report_hash: sha(req.body), db_table: "music_source_adapter_runs_v41", received: req.body ?? {} }));
    app.post("/api/internal/music-folk-song/v41/review-report", (req, res) => res.json({ ok: true, accepted: true, version: "v41", report_hash: sha(req.body), db_table: "music_review_transactions_v41", received: req.body ?? {} }));
    app.post("/api/internal/music-folk-song/v41/youtube-metadata-report", (req, res) => {
        const text = JSON.stringify(req.body ?? {});
        const blocked = blockedTerms.filter((term) => text.includes(term));
        const bad = lyricPatterns.test(text);
        res.json({ ok: blocked.length === 0 && !bad, accepted: blocked.length === 0 && !bad, version: "v41", report_hash: sha(req.body), db_table: "music_youtube_metadata_runs_v41", blocked_terms: blocked, prohibited_action_detected: bad });
    });
    app.post("/api/internal/search/music/v41/populate-fulltext", (req, res) => res.json({ ok: true, accepted: true, version: "v41", report_hash: sha(req.body), db_table: "music_fulltext_population_runs_v41", received: req.body ?? {} }));
    app.get("/api/public/true-knowledge/v41/music/cards", (_req, res) => res.json(readJson("data/content/public_source_grounded_cards_v41.json")));
    app.get("/api/public/true-knowledge/v41/music/search-documents", (_req, res) => res.json(readJson("data/search/public_search_documents_v41.json")));
    app.get("/api/public/true-knowledge/v41/music/claims", (_req, res) => res.json(readJson("data/content/source_grounded_claims_v41_additions.json")));
    app.get("/api/public/ai-article/v41/music-tts-stt-source-packets", (_req, res) => res.json(readJson("data/ai/frontend_music_tts_stt_source_packets_v41.json")));
    app.post("/api/internal/ai-article/v41/music-grounding-check", (req, res) => {
        const text = JSON.stringify(req.body ?? {});
        const blocked = blockedTerms.filter((term) => text.includes(term));
        const lyricsRisk = lyricPatterns.test(text);
        const hasClaims = /claim_ids|claimIds/.test(text);
        const hasSources = /source_ids|sourceIds/.test(text);
        res.json({ ok: blocked.length === 0 && !lyricsRisk && hasClaims && hasSources, blocked_terms: blocked, lyrics_risk: lyricsRisk, has_claims: hasClaims, has_sources: hasSources, required: ["claim_ids", "source_ids", "no_lyrics", "no_audio_download", "no_unlicensed_training"] });
    });
    app.get("/api/ops/next-upgrade-plan/v42", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v42.json")));
}
