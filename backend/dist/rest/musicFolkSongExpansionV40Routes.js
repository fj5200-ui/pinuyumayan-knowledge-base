import fs from "node:fs";
import path from "node:path";
function readJson(rel) { const root = process.cwd().endsWith("backend") ? path.resolve(process.cwd(), "..") : process.cwd(); return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")); }
const blockedTerms = ["卑南文化遺址", "卑南遺址", "卑南考古遺址", "卑南文化公園", "卑南遺址公園", "Peinan Site", "Beinan Site", "Peinan Archaeological Site"];
export function registerMusicFolkSongExpansionV40Routes(app) {
    app.get("/api/ops/music-folk-song/v40/source-registry", (_req, res) => res.json(readJson("data/sources/music_folk_song_expansion_registry_v40.json")));
    app.get("/api/ops/music-folk-song/v40/catalog", (_req, res) => res.json(readJson("data/music/folk_song_expanded_catalog_v40.json")));
    app.get("/api/ops/music-folk-song/v40/relation-variant-index", (_req, res) => res.json(readJson("data/music/folk_song_relation_variant_index_v40.json")));
    app.get("/api/ops/music-folk-song/v40/search-config", (_req, res) => res.json(readJson("data/search/music_folk_song_expanded_search_v40.json")));
    app.get("/api/ops/music-folk-song/v40/review-queue", (_req, res) => res.json(readJson("data/admin/music_folk_song_review_queue_v40.json")));
    app.get("/api/ops/music-folk-song/v40/rights-policy", (_req, res) => res.json(readJson("data/security/music_folk_song_rights_policy_v40.json")));
    app.get("/api/ops/music-folk-song/v40/youtube-worker-contract", (_req, res) => res.json(readJson("data/integration/music_folk_song_youtube_metadata_worker_v40.json")));
    app.post("/api/internal/music-folk-song/v40/ingestion-report", (req, res) => res.json({ ok: true, accepted: true, version: "v40", kind: "music_folk_song_ingestion_report", received: req.body ?? {} }));
    app.post("/api/internal/music-folk-song/v40/review-report", (req, res) => res.json({ ok: true, accepted: true, version: "v40", kind: "music_folk_song_review_report", received: req.body ?? {} }));
    app.post("/api/internal/music-folk-song/v40/youtube-metadata-report", (req, res) => res.json({ ok: true, accepted: true, version: "v40", kind: "youtube_metadata_report", received: req.body ?? {} }));
    app.get("/api/public/true-knowledge/v40/music/cards", (_req, res) => res.json(readJson("data/content/public_source_grounded_cards_v40.json")));
    app.get("/api/public/true-knowledge/v40/music/search-documents", (_req, res) => res.json(readJson("data/search/public_search_documents_v40.json")));
    app.get("/api/public/true-knowledge/v40/music/claims", (_req, res) => res.json(readJson("data/content/source_grounded_claims_v40_additions.json")));
    app.get("/api/public/ai-article/v40/music-source-packets", (_req, res) => res.json(readJson("data/ai/frontend_folk_song_source_packets_v40.json")));
    app.post("/api/internal/ai-article/v40/music-grounding-check", (req, res) => { const text = JSON.stringify(req.body ?? {}); const blocked = blockedTerms.filter((term) => text.includes(term)); const lyricsRisk = /(歌詞全文|完整歌詞|逐字歌詞|下載音訊|下載影片|仿古調歌詞|模仿古調|訓練歌聲|歌聲模型)/.test(text); const hasClaims = /claim_ids|claimIds/.test(text); const hasSources = /source_ids|sourceIds/.test(text); res.json({ ok: blocked.length === 0 && !lyricsRisk && hasClaims && hasSources, blocked_terms: blocked, lyrics_risk: lyricsRisk, has_claims: hasClaims, has_sources: hasSources, required: ["claim_ids", "source_ids", "no_lyrics", "no_audio_download", "rights_status"] }); });
    app.get("/api/ops/next-upgrade-plan/v41", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v41.json")));
}
