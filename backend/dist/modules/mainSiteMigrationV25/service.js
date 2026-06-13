export function getMainSiteInstallManifestV25() {
    return {
        version: "v25",
        requiredEnv: ["NEXT_PUBLIC_KB_API_URL", "PINUYUMAYAN_KB_API_URL", "PINUYUMAYAN_MAIN_SITE_API_KEY", "PINUYUMAYAN_HMAC_SECRET", "AI_PROVIDER"],
        requiredRoutes: ["/api/kb/connection-check", "/api/ai/compose", "/api/ai/validate-draft", "/api/ai/submit-review"],
        forbiddenRelations: ["卑南文化遺址", "卑南遺址", "Beinan Site", "Peinan Site"],
        ready: true
    };
}
export function getMigrationReadinessV25() {
    return {
        version: "v25",
        checks: [
            { key: "public_api", status: "configured" },
            { key: "internal_hmac", status: "requires_runtime_secret" },
            { key: "server_ai_route", status: "copy_from_webapp" },
            { key: "admin_review_api", status: "scaffold_ready" },
            { key: "forbidden_beinan_relation", status: "enforced_by_policy" }
        ]
    };
}
