import { readFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
function projectRoot() {
    return process.env.PINUYUMAYAN_PROJECT_ROOT || path.resolve(process.cwd(), "..");
}
let manifestCache = null;
async function readJson(relativePath) {
    const absolute = path.join(projectRoot(), relativePath);
    return JSON.parse(await readFile(absolute, "utf8"));
}
export async function loadAudioPlaybackManifest() {
    if (manifestCache && process.env.PINUYUMAYAN_DISABLE_STATIC_JSON_CACHE !== "true")
        return manifestCache;
    const payload = await readJson("data/audio/puyuma_audio_playback_manifest_v17.json");
    manifestCache = { policy: payload.policy, entries: payload.entries ?? [], counts: payload.counts ?? {} };
    return manifestCache;
}
export async function getAudioAsset(assetId) {
    const manifest = await loadAudioPlaybackManifest();
    const item = manifest.entries.find((x) => x.asset_id === assetId || x.entry_id === assetId) ?? null;
    return item;
}
export function audioEtag(asset) {
    return `W/"audio-${crypto.createHash("sha256").update(asset.etag_seed || asset.source_audio_url).digest("hex").slice(0, 24)}"`;
}
export function assertAllowedSource(asset) {
    const parsed = new URL(asset.source_audio_url);
    const allowedHosts = new Set((process.env.AUDIO_PROXY_ALLOWED_HOSTS ?? "web.klokah.tw,klokah.tw").split(",").map((x) => x.trim()).filter(Boolean));
    if (!allowedHosts.has(parsed.hostname)) {
        const error = new Error("Audio source host is not allowlisted");
        error.status = 403;
        throw error;
    }
    if (!asset.public_playback_allowed) {
        const error = new Error("Audio asset is not approved for public playback");
        error.status = 403;
        throw error;
    }
    return parsed;
}
export async function buildAudioHead(assetId) {
    const asset = await getAudioAsset(assetId);
    if (!asset)
        return null;
    assertAllowedSource(asset);
    return {
        assetId: asset.asset_id,
        entryId: asset.entry_id,
        puyumaForm: asset.puyuma_form,
        zhTw: asset.zh_tw,
        dialectCode: asset.dialect_code,
        dialectZh: asset.dialect_zh,
        mimeType: asset.mime_type,
        playback: {
            sourceAudioUrl: asset.source_audio_url,
            proxyUrl: asset.proxy_url,
            directPlayable: true,
            proxyPlayable: true,
            mode: "human_recorded_source_audio_primary"
        },
        review: {
            reviewStatus: asset.review_status,
            requiresNativeReviewForTeaching: Boolean(asset.requires_native_review_for_teaching),
            licenseReviewRequiredBeforeCommercialUse: Boolean(asset.license_review_required_before_commercial_use)
        },
        source: asset.source,
        etag: audioEtag(asset)
    };
}
export async function searchAudioAssets(input) {
    const manifest = await loadAudioPlaybackManifest();
    const q = String(input.q ?? "").trim().toLowerCase();
    let rows = manifest.entries;
    if (input.dialectCode)
        rows = rows.filter((x) => x.dialect_code === input.dialectCode);
    if (q) {
        rows = rows.filter((x) => [x.puyuma_form, x.zh_tw, x.dialect_zh, x.entry_id].some((v) => String(v ?? "").toLowerCase().includes(q)));
    }
    return rows.slice(0, input.limit ?? 50).map((asset) => ({
        assetId: asset.asset_id,
        entryId: asset.entry_id,
        puyumaForm: asset.puyuma_form,
        zhTw: asset.zh_tw,
        dialectCode: asset.dialect_code,
        dialectZh: asset.dialect_zh,
        sourceAudioUrl: asset.source_audio_url,
        proxyUrl: asset.proxy_url,
        mimeType: asset.mime_type,
        reviewStatus: asset.review_status
    }));
}
