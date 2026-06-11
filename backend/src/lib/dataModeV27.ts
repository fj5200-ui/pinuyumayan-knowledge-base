import type { Request } from "express";
import { execute } from "./dbQuery";

export type RuntimeEnvironmentV27 = "development" | "staging" | "production";

export function runtimeEnvironmentV27(): RuntimeEnvironmentV27 {
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === "production") return "production";
  if (process.env.APP_ENV === "staging") return "staging";
  return "development";
}

export function knowledgeDataModeV27() {
  return process.env.KNOWLEDGE_DATA_MODE ?? "db";
}

export function productionStaticFallbackAllowedV27() {
  if (runtimeEnvironmentV27() !== "production") return true;
  if (process.env.DISABLE_PRODUCTION_STATIC_FALLBACK === "false") return true;
  return false;
}

export async function recordDbFallbackEventV27(req: Request, args: { routeGroup: string; fallbackSource?: string; error?: unknown; blocked: boolean }) {
  try {
    const error = args.error instanceof Error ? args.error : undefined;
    await execute(
      `INSERT INTO db_fallback_events_v27 (route_path, route_group, environment, fallback_source, db_error_code, db_error_message, blocked, request_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.originalUrl, args.routeGroup, runtimeEnvironmentV27(), args.fallbackSource ?? null, (error as any)?.code ?? null, error?.message ?? null, args.blocked, (req as any).requestId ?? null]
    );
  } catch { /* fallback audit cannot crash request */ }
}

export function assertProductionDbFallbackPolicyV27() {
  return {
    version: "v27",
    environment: runtimeEnvironmentV27(),
    knowledgeDataMode: knowledgeDataModeV27(),
    productionStaticFallbackAllowed: productionStaticFallbackAllowedV27(),
    recommendedProductionEnv: {
      NODE_ENV: "production",
      KNOWLEDGE_DATA_MODE: "db",
      DISABLE_PRODUCTION_STATIC_FALLBACK: "true"
    }
  };
}
