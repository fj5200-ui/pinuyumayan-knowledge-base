import type { Request, Response, NextFunction } from "express";
import { verifyMainSiteApiKey } from "./apiKeyAuth";

export type ApiScope =
  | "knowledge:read"
  | "vocabulary:read"
  | "sync:replay"
  | "export:read"
  | "export:write"
  | "jobs:write";

const defaultScopes = new Set<ApiScope>([
  "knowledge:read",
  "vocabulary:read",
  "sync:replay",
  "export:read",
  "export:write",
  "jobs:write"
]);

export function requireApiScopes(scopes: ApiScope[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = verifyMainSiteApiKey(req);
    if (!auth.ok) {
      return res.status(401).json({ ok: false, error: { code: "unauthorized", message: "Invalid or missing main-site API key" } });
    }
    const configured = process.env.PINUYUMAYAN_MAIN_SITE_API_SCOPES?.split(",").map((s) => s.trim()).filter(Boolean);
    const granted = configured?.length ? new Set(configured as ApiScope[]) : defaultScopes;
    const missing = scopes.filter((scope) => !granted.has(scope));
    if (missing.length) {
      return res.status(403).json({ ok: false, error: { code: "missing_scope", message: `Missing API scope: ${missing.join(",")}` } });
    }
    return next();
  };
}
