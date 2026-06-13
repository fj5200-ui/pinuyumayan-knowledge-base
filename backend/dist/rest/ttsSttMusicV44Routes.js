import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
function rootDir() {
    return process.cwd().endsWith("backend") ? path.resolve(process.cwd(), "..") : process.cwd();
}
function readJson(rel) {
    return JSON.parse(fs.readFileSync(path.join(rootDir(), rel), "utf8"));
}
function sha(input) {
    return crypto.createHash("sha256").update(JSON.stringify(input ?? {})).digest("hex");
}
const blockedTerms = ["卑南文化遺址", "卑南遺址", "卑南考古遺址", "卑南文化公園", "Peinan Site", "Beinan Site", "Peinan Archaeological Site"];
export function registerTtsSttMusicV44Routes(app) {
    app.get("/api/ops/speech-training/v44/authorized-review", (_req, res) => res.json(readJson("data/audio/speech_asset_authorization_v44.json")));
    app.get("/api/ops/speech-training/v44/export-contract", (_req, res) => res.json(readJson("data/audio/tts_stt_export_contract_v44.json")));
    app.post("/api/internal/speech-training/v44/export-report", (req, res) => {
        const body = req.body ?? {};
        res.json({
            ok: true,
            accepted: true,
            version: "v44",
            report_hash: sha(body),
            db_tables: ["speech_dataset_exports_v44", "speech_model_cards_v44"],
            public_release_allowed: false,
            received: body,
        });
    });
    app.get("/api/ops/search/music/v44/db-contract", (_req, res) => res.json(readJson("data/search/music_fulltext_db_contract_v44.json")));
    app.get("/api/ops/authority-sources/v44/worker-contract", (_req, res) => res.json(readJson("data/integration/authority_source_worker_v44.json")));
    app.post("/api/internal/authority-sources/v44/candidate-ingest", (req, res) => {
        const text = JSON.stringify(req.body ?? {});
        const blocked = blockedTerms.filter((term) => text.includes(term));
        res.json({
            ok: blocked.length === 0,
            accepted: blocked.length === 0,
            version: "v44",
            blocked_terms: blocked,
            report_hash: sha(req.body),
            db_tables: ["authority_source_fetch_runs_v44", "authority_source_candidates_v44", "music_candidate_reviews_v44"],
            public_auto_release: false,
        });
    });
    app.get("/api/admin/music-speech/v44/review-center", (_req, res) => res.json(readJson("data/admin/music_speech_review_center_v44.json")));
    app.get("/api/public/music/v44/metadata/:id", (req, res) => {
        const id = req.params.id;
        const docs = readJson("data/search/music_search_documents_v44.seed.json").documents ?? [];
        const doc = docs.find((item) => item.id === id);
        if (!doc)
            return res.status(404).json({ ok: false, error: "music_metadata_not_found", id });
        res.json({ ok: true, version: "v44", metadata_only: true, no_lyrics: true, no_audio_download: true, item: doc });
    });
    app.get("/api/public/music/v44/search-page", (_req, res) => res.json(readJson("data/site/main_site_music_tts_pages_v44.json").routes.find((r) => r.path === "/music/search")));
    app.get("/api/public/speech/v44/tts-stt-info", (_req, res) => res.json({ ok: true, version: "v44", public_tts_enabled: false, public_stt_enabled: false, contract: readJson("data/audio/tts_stt_export_contract_v44.json"), review: readJson("data/audio/speech_asset_authorization_v44.json").current_state }));
    app.get("/api/ops/next-upgrade-plan/v45", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v45.json")));
}
