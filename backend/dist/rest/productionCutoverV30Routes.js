import crypto from "crypto";
import fs from "fs";
import path from "path";
function readJson(relativePath, fallback) {
    const cwd = process.cwd();
    const candidates = [
        path.resolve(cwd, relativePath),
        path.resolve(cwd, "..", relativePath),
        path.resolve(__dirname, "../../../", relativePath),
    ];
    for (const file of candidates) {
        try {
            if (fs.existsSync(file))
                return JSON.parse(fs.readFileSync(file, "utf8"));
        }
        catch (err) {
            return { error: "invalid_json", file, detail: String(err), fallback };
        }
    }
    return fallback;
}
function sha256(value) {
    return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
function reportAccepted(req, res, kind) {
    const payload = req.body ?? {};
    res.json({ ok: true, kind, receivedAt: new Date().toISOString(), payloadHash: sha256(payload), status: payload.status ?? "received" });
}
export function registerProductionCutoverV30Routes(app) {
    app.get("/api/ops/cutover/v30/checklist", (_req, res) => {
        const checklist = readJson("data/deployment/production_cutover_checklist_v30.json", { version: "v30", phases: [] });
        res.json({ ok: true, checklist });
    });
    app.get("/api/ops/cutover/v30/readiness", (_req, res) => {
        const checklist = readJson("data/deployment/production_cutover_checklist_v30.json", { phases: [] });
        const total = (checklist.phases ?? []).reduce((sum, phase) => sum + (phase.checks?.length ?? 0), 0);
        res.json({
            ok: true,
            version: "v30",
            mode: process.env.NODE_ENV ?? "development",
            dbMode: process.env.KNOWLEDGE_DATA_MODE ?? "unset",
            staticFallbackDisabled: process.env.DISABLE_PRODUCTION_STATIC_FALLBACK === "true",
            hmacEnabled: process.env.PINUYUMAYAN_HMAC_ENABLED === "true",
            totalChecklistItems: total,
            launchRecommendation: process.env.NODE_ENV === "production" && process.env.KNOWLEDGE_DATA_MODE !== "db" ? "block" : "review_required"
        });
    });
    app.post("/api/internal/cutover/v30/readiness-report", (req, res) => reportAccepted(req, res, "cutover_readiness_report"));
    app.get("/api/ops/main-site/v30/acceptance", (_req, res) => {
        const acceptance = readJson("data/integration/main_site_cutover_acceptance_v30.json", { version: "v30", tests: [] });
        res.json({ ok: true, acceptance });
    });
    app.post("/api/internal/main-site/v30/acceptance-report", (req, res) => reportAccepted(req, res, "main_site_acceptance_report"));
    app.get("/api/ops/seo/v30/launch-checklist", (_req, res) => {
        const seo = readJson("data/seo/production_seo_launch_v30.json", { version: "v30" });
        res.json({ ok: true, seo });
    });
    app.post("/api/internal/seo/v30/launch-report", (req, res) => reportAccepted(req, res, "seo_launch_report"));
    app.get("/api/ops/search/v30/quality-suite", (_req, res) => {
        const suite = readJson("data/search/search_quality_suite_v30.json", { version: "v30", queries: [] });
        res.json({ ok: true, suite });
    });
    app.post("/api/internal/search/v30/quality-report", (req, res) => reportAccepted(req, res, "search_quality_report"));
    app.get("/api/ops/secrets/v30/rotation-plan", (_req, res) => {
        const plan = readJson("data/security/production_secret_rotation_v30.json", { version: "v30", secrets: [] });
        res.json({ ok: true, plan });
    });
    app.post("/api/internal/production/v30/rollback-report", (req, res) => reportAccepted(req, res, "production_rollback_report"));
    app.get("/api/ops/next-upgrade-plan/v31", (_req, res) => {
        const plan = readJson("data/development/next_upgrade_plan_v31.json", { version: "v31", priorities: [] });
        res.json({ ok: true, plan });
    });
}
