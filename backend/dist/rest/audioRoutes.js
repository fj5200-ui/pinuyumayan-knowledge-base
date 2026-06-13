import { Readable } from "node:stream";
import { ok, fail } from "../lib/apiResponse";
import { setPublicCache } from "../lib/cacheHeaders";
import { audioEtag, buildAudioHead, getAudioAsset, loadAudioPlaybackManifest, searchAudioAssets, assertAllowedSource } from "../modules/pronunciation/audioService";
function asyncRoute(handler) {
    return (req, res, next) => handler(req, res).catch(next);
}
export function registerAudioRoutes(app) {
    app.get("/api/public/audio/manifest", asyncRoute(async (_req, res) => {
        const manifest = await loadAudioPlaybackManifest();
        setPublicCache(res, 86400, 86400);
        ok(res, {
            policy: manifest.policy,
            counts: manifest.counts,
            entries: manifest.entries.map((x) => ({
                assetId: x.asset_id,
                entryId: x.entry_id,
                dialectCode: x.dialect_code,
                dialectZh: x.dialect_zh,
                puyumaForm: x.puyuma_form,
                zhTw: x.zh_tw,
                mimeType: x.mime_type,
                sourceAudioUrl: x.source_audio_url,
                proxyUrl: x.proxy_url,
                headUrl: x.head_url,
                reviewStatus: x.review_status,
                requiresNativeReviewForTeaching: x.requires_native_review_for_teaching
            }))
        });
    }));
    app.get("/api/public/audio/head/:assetId", asyncRoute(async (req, res) => {
        const head = await buildAudioHead(req.params.assetId);
        if (!head)
            return fail(res, 404, "NOT_FOUND", "Audio asset not found");
        res.setHeader("ETag", head.etag);
        setPublicCache(res, 3600, 86400);
        ok(res, head);
    }));
    app.get("/api/public/audio/search", asyncRoute(async (req, res) => {
        const q = String(req.query.q ?? "").trim();
        const dialectCode = String(req.query.dialectCode ?? "").trim() || undefined;
        const limit = Math.min(Number(req.query.limit ?? 50), 100);
        setPublicCache(res, 300, 3600);
        ok(res, { items: await searchAudioAssets({ q, dialectCode, limit }) });
    }));
    app.get("/api/public/audio/proxy/:assetId", asyncRoute(async (req, res) => {
        const asset = await getAudioAsset(req.params.assetId);
        if (!asset)
            return fail(res, 404, "NOT_FOUND", "Audio asset not found");
        let parsed;
        try {
            parsed = assertAllowedSource(asset);
        }
        catch (error) {
            return fail(res, error.status ?? 403, "FORBIDDEN", error.message);
        }
        const etag = audioEtag(asset);
        if (req.header("if-none-match") === etag) {
            res.status(304).end();
            return;
        }
        const upstream = await fetch(parsed.toString(), {
            headers: req.header("range") ? { range: String(req.header("range")) } : undefined
        });
        if (!upstream.ok && upstream.status !== 206) {
            return fail(res, 502, "INTERNAL_ERROR", "Upstream audio source failed", { status: upstream.status });
        }
        res.status(upstream.status);
        res.setHeader("Content-Type", upstream.headers.get("content-type") || asset.mime_type || "audio/mpeg");
        res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
        res.setHeader("ETag", etag);
        res.setHeader("X-Pinuyumayan-Audio-Mode", "human-recorded-source-audio");
        const length = upstream.headers.get("content-length");
        const range = upstream.headers.get("content-range");
        if (length)
            res.setHeader("Content-Length", length);
        if (range)
            res.setHeader("Content-Range", range);
        res.setHeader("Accept-Ranges", "bytes");
        if (!upstream.body) {
            res.end();
            return;
        }
        Readable.fromWeb(upstream.body).pipe(res);
    }));
}
