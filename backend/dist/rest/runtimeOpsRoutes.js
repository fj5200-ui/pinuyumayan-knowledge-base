import { setNoStore } from "../lib/cacheHeaders";
export function registerRuntimeOpsRoutes(app) {
    app.get("/api/ops/runtime", (_req, res) => {
        setNoStore(res);
        res.json({
            ok: true,
            service: "pinuyumayan-backend-database",
            runtime: {
                nodeEnv: process.env.NODE_ENV ?? "development",
                apiVersion: "v10",
                fullCorpusImportAtStartup: false,
                mainSitePullEnabled: true,
                openApiEnabled: true
            }
        });
    });
}
