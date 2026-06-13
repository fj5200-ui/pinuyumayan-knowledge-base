import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { setPublicCache } from "../lib/cacheHeaders";
const __dirname = dirname(fileURLToPath(import.meta.url));
const specPath = resolve(__dirname, "../../../openapi/pinuyumayan-main-site-api.openapi.json");
export function registerOpenApiRoutes(app) {
    app.get("/api/ops/openapi.json", (_req, res) => {
        const spec = JSON.parse(readFileSync(specPath, "utf-8"));
        setPublicCache(res, 300, 3600);
        res.json(spec);
    });
    app.get("/api/ops/openapi", (_req, res) => {
        setPublicCache(res, 300, 3600);
        res.type("html").send(`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"/><title>Pinuyumayan API</title></head><body><h1>Pinuyumayan Backend Database API</h1><p>OpenAPI JSON: <a href="/api/ops/openapi.json">/api/ops/openapi.json</a></p></body></html>`);
    });
}
