import { ok, fail } from "../lib/apiResponse";
import { requireInternalApiKey } from "../security/apiKeyAuth";
import { getPronunciationForEntry, requestTtsLikeSourceAudio, loadVoiceModelRegistry } from "../modules/pronunciation/service";
import { searchAudioAssets, loadAudioPlaybackManifest } from "../modules/pronunciation/audioService";
function asyncRoute(handler) {
    return (req, res, next) => handler(req, res).catch(next);
}
export function registerPronunciationRoutes(app) {
    app.get("/api/public/pronunciation/:entryId", asyncRoute(async (req, res) => {
        const result = await getPronunciationForEntry(req.params.entryId);
        if (!result.ok)
            return fail(res, 404, "NOT_FOUND", "Pronunciation audio was not found for this entry");
        ok(res, result);
    }));
    app.get("/api/public/tts/pronounce", asyncRoute(async (req, res) => {
        const text = String(req.query.text ?? "").trim();
        const entryId = String(req.query.entryId ?? "").trim() || undefined;
        const dialectCode = String(req.query.dialectCode ?? "").trim() || undefined;
        if (!text && !entryId)
            return fail(res, 400, "BAD_REQUEST", "Provide text or entryId");
        ok(res, await requestTtsLikeSourceAudio({ text, entryId, dialectCode, allowSynthetic: false }));
    }));
    app.get("/api/public/pronunciation/search", asyncRoute(async (req, res) => {
        const q = String(req.query.q ?? "").trim();
        const dialectCode = String(req.query.dialectCode ?? "").trim() || undefined;
        const limit = Math.min(Number(req.query.limit ?? 50), 100);
        ok(res, { items: await searchAudioAssets({ q, dialectCode, limit }) });
    }));
    app.get("/api/public/pronunciation/player-config", asyncRoute(async (_req, res) => {
        const manifest = await loadAudioPlaybackManifest();
        ok(res, {
            mode: "human_recorded_source_audio_first",
            syntheticTtsPublicEnabled: false,
            proxyAvailable: true,
            allowedHosts: manifest.policy?.allowed_source_hosts ?? [],
            fallbackOrder: ["sourceAudioUrl", "proxyUrl", "adminReviewQueue"],
            noticeZh: "有真人來源音檔才公開播放；沒有音檔時不以假 TTS 冒充。"
        });
    }));
    app.get("/api/admin/tts/models", requireInternalApiKey, asyncRoute(async (_req, res) => {
        ok(res, { models: await loadVoiceModelRegistry() });
    }));
    app.post("/api/internal/tts/synthesize", requireInternalApiKey, asyncRoute(async (req, res) => {
        const { text, entryId, dialectCode, allowSynthetic } = req.body ?? {};
        if (!text && !entryId)
            return fail(res, 400, "BAD_REQUEST", "Provide text or entryId");
        ok(res, await requestTtsLikeSourceAudio({ text, entryId, dialectCode, allowSynthetic: Boolean(allowSynthetic) }), 202);
    }));
}
