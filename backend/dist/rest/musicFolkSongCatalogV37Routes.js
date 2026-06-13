import fs from "node:fs";
import path from "node:path";
function readJson(rel) {
    const root = process.cwd().endsWith("backend") ? path.resolve(process.cwd(), "..") : process.cwd();
    const file = path.join(root, rel);
    return JSON.parse(fs.readFileSync(file, "utf8"));
}
export function registerMusicFolkSongCatalogV37Routes(app) {
    app.get("/api/ops/music-folk-song/v37/source-registry", (_req, res) => res.json(readJson("data/sources/music_folk_song_source_registry_v37.json")));
    app.get("/api/ops/music-folk-song/v37/catalog", (_req, res) => res.json(readJson("data/music/folk_song_catalog_v37.json")));
    app.get("/api/ops/music-folk-song/v37/taxonomy", (_req, res) => res.json(readJson("data/music/folk_song_taxonomy_v37.json")));
    app.get("/api/ops/music-folk-song/v37/search-config", (_req, res) => res.json(readJson("data/search/music_folk_song_expanded_search_v37.json")));
    app.get("/api/ops/music-folk-song/v37/review-queue", (_req, res) => res.json(readJson("data/admin/music_folk_song_review_queue_v37.json")));
    app.get("/api/ops/music-folk-song/v37/rights-policy", (_req, res) => res.json(readJson("data/security/music_folk_song_rights_policy_v37.json")));
    app.get("/api/ops/music-folk-song/v37/youtube-worker-contract", (_req, res) => res.json(readJson("data/integration/youtube_folk_song_metadata_worker_v37.json")));
    app.post("/api/internal/music-folk-song/v37/ingestion-report", (req, res) => res.json({ ok: true, accepted: true, version: "v37", kind: "music_folk_song_ingestion_report", received: req.body ?? {} }));
    app.post("/api/internal/music-folk-song/v37/review-report", (req, res) => res.json({ ok: true, accepted: true, version: "v37", kind: "music_folk_song_review_report", received: req.body ?? {} }));
    app.get("/api/public/true-knowledge/v37/music/cards", (_req, res) => res.json(readJson("data/content/public_source_grounded_cards_v37.json")));
    app.get("/api/public/true-knowledge/v37/music/search-documents", (_req, res) => res.json(readJson("data/search/public_search_documents_v37.json")));
    app.get("/api/public/true-knowledge/v37/music/claims", (_req, res) => res.json(readJson("data/content/source_grounded_claims_v37_additions.json")));
    app.get("/api/public/ai-article/v37/music-source-packets", (_req, res) => res.json(readJson("data/ai/frontend_folk_song_source_packets_v37.json")));
    app.post("/api/internal/ai-article/v37/music-grounding-check", (req, res) => {
        const text = JSON.stringify(req.body ?? {});
        const blocked = ["卑南文化遺址", "卑南遺址", "卑南考古遺址", "卑南文化公園", "卑南遺址公園", "Peinan Site", "Beinan Site", "Peinan Archaeological Site"].filter((term) => text.includes(term));
        const lyricsRisk = /(歌詞全文|完整歌詞|逐字歌詞|下載音訊|下載影片|仿古調歌詞)/.test(text);
        res.json({ ok: blocked.length === 0 && !lyricsRisk, blocked_terms: blocked, lyrics_risk: lyricsRisk, required: ["claim_ids", "source_ids", "no_lyrics", "no_audio_download"] });
    });
    app.get("/api/ops/next-upgrade-plan/v38", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v38.json")));
}
