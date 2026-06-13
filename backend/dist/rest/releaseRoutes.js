import { listReleaseChannels } from "../modules/releaseChannels/service";
export function registerReleaseRoutes(app) {
    app.get("/api/public/release-channels", (_req, res) => {
        res.json({ ok: true, data: listReleaseChannels() });
    });
    app.get("/api/ops/governance-dashboard", (_req, res) => {
        res.json({
            ok: true,
            data: {
                widgets: [
                    "release_channel_counts",
                    "full_corpus_import_progress",
                    "main_site_sync_health",
                    "quality_blockers",
                    "public_api_slo",
                    "search_export_status"
                ]
            }
        });
    });
}
