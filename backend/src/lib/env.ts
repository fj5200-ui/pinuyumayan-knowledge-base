import "dotenv/config";

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 8787),
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  publicBaseUrl: process.env.PUBLIC_KNOWLEDGE_BASE_URL ?? "http://localhost:8787",
  mainSiteApiKey: process.env.PINUYUMAYAN_MAIN_SITE_API_KEY ?? "",
  publicRateLimitPerMinute: Number(process.env.PUBLIC_RATE_LIMIT_PER_MINUTE ?? 120),
  internalRateLimitPerMinute: Number(process.env.INTERNAL_RATE_LIMIT_PER_MINUTE ?? 600),
  cacheDefaultTtlSeconds: Number(process.env.KNOWLEDGE_CACHE_DEFAULT_TTL_SECONDS ?? 300),
  webhookSigningSecret: process.env.PINUYUMAYAN_WEBHOOK_SIGNING_SECRET ?? "",
  adminSessionSecret: process.env.ADMIN_SESSION_SECRET ?? "",
  adminSuperuserEmail: process.env.ADMIN_SUPERUSER_EMAIL ?? "",
  mainSiteAdminSyncEnabled: process.env.MAIN_SITE_ADMIN_SYNC_ENABLED === "true"
};

export function assertProductionEnv() {
  if (env.nodeEnv !== "production") return;
  const missing: string[] = [];
  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (!env.mainSiteApiKey) missing.push("PINUYUMAYAN_MAIN_SITE_API_KEY");
  if (!env.adminSessionSecret) missing.push("ADMIN_SESSION_SECRET");
  if (env.corsOrigin === "*") missing.push("CORS_ORIGIN must not be * in production");
  if (missing.length) {
    throw new Error(`Missing/unsafe production environment: ${missing.join(", ")}`);
  }
}
