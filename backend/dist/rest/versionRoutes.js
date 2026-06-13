import { sendJsonWithEtag } from "../lib/etag";
export function registerVersionRoutes(app) {
    app.get("/api/public/version", (req, res) => {
        const version = req.header("x-pinuyumayan-api-version") || "2026-06-11";
        return sendJsonWithEtag(req, res, {
            ok: true,
            apiVersion: version,
            supportedVersions: ["2026-06-11"],
            service: "pinuyumayan-backend-database",
            previewCorpusEntries: 80,
            fullCorpusImportAtStartup: false
        }, 300);
    });
}
