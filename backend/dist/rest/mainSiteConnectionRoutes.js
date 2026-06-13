import { getMainSiteConnectionStatus } from "../modules/mainSiteConnection/service";
export function registerMainSiteConnectionRoutes(app) {
    app.get("/api/ops/main-site-connection", (_req, res) => {
        res.json(getMainSiteConnectionStatus());
    });
    app.get("/api/public/main-site-connection/config", (_req, res) => {
        res.json({
            version: "v23",
            publicBaseUrl: process.env.PUBLIC_KNOWLEDGE_BASE_URL ?? null,
            aiGenerationLocation: "main_site_server_route",
            browserSafe: true,
            forbiddenRelationRule: "Beinan/Peinan archaeological site terms are blocked from Pinuyumayan source packets and related content."
        });
    });
}
