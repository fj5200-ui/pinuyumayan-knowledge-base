import fs from "node:fs";
import path from "node:path";
function readJson(rel) {
    const root = process.cwd().endsWith("backend") ? path.resolve(process.cwd(), "..") : process.cwd();
    return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}
export function registerMusicFolkSongDeepV38Routes(app) {
    app.get("/api/ops/music-folk-song/v38/source-registry", (_req, res) => res.json(readJson("data/sources/music_folk_song_deep_source_registry_v38.json")));
    app.get("/api/ops/music-folk-song/v38/catalog", (_req, res) => res.json(readJson("data/music/folk_song_deep_catalog_v38.json")));
    app.get("/api/ops/music-folk-song/v38/variant-index", (_req, res) => res.json(readJson("data/music/folk_song_variant_index_v38.json")));
    app.get("/api/ops/music-folk-song/v38/search-config", (_req, res) => res.json(readJson("data/search/music_folk_song_deep_search_v38.json")));
    app.get("/api/ops/music-folk-song/v38/review-queue", (_req, res) => res.json(readJson("data/admin/music_folk_song_review_queue_v38.json")));
    app.get("/api/ops/music-folk-song/v38/rights-policy", (_req, res) => res.json(readJson("data/security/music_folk_song_deep_rights_policy_v38.json")));
    app.get("/api/ops/music-folk-song/v38/youtube-worker-contract", (_req, res) => res.json(readJson("data/integration/youtube_folk_song_metadata_worker_v38.json")));
    app.post("/api/internal/music-folk-song/v38/ingestion-report", (req, res) => res.json({ ok: true, accepted: true, version: "v38", kind: "music_folk_song_deep_ingestion_report", received: req.body ?? {} }));
    app.post("/api/internal/music-folk-song/v38/review-report", (req, res) => res.json({ ok: true, accepted: true, version: "v38", kind: "music_folk_song_deep_review_report", received: req.body ?? {} }));
    app.get("/api/public/true-knowledge/v38/music/cards", (_req, res) => res.json(readJson("data/content/public_source_grounded_cards_v38.json")));
    app.get("/api/public/true-knowledge/v38/music/search-documents", (_req, res) => res.json(readJson("data/search/public_search_documents_v38.json")));
    app.get("/api/public/true-knowledge/v38/music/claims", (_req, res) => res.json(readJson("data/content/source_grounded_claims_v38_additions.json")));
    app.get("/api/public/ai-article/v38/music-source-packets", (_req, res) => res.json(readJson("data/ai/frontend_folk_song_source_packets_v38.json")));
    app.post("/api/internal/ai-article/v38/music-grounding-check", (req, res) => {
        const text = JSON.stringify(req.body ?? {});
        const blocked = ["卑南文化遺址", "卑南遺址", "卑南考古遺址", "卑南文化公園", "卑南遺址公園", "Peinan Site", "Beinan Site", "Peinan Archaeological Site"].filter((term) => text.includes(term));
        const lyricsRisk = /(歌詞全文|完整歌詞|逐字歌詞|下載音訊|下載影片|仿古調歌詞|模仿古調|訓練歌聲)/.test(text);
        res.json({ ok: blocked.length === 0 && !lyricsRisk, blocked_terms: blocked, lyrics_risk: lyricsRisk, required: ["claim_ids", "source_ids", "no_lyrics", "no_audio_download", "rights_status"] });
    });
    app.get("/api/ops/next-upgrade-plan/v39", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v39.json")));
}
