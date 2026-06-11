import type { Request, Response, NextFunction } from "express";
import { env } from "../lib/env";
import { fail } from "../lib/apiResponse";

export function requireInternalApiKey(req: Request, res: Response, next: NextFunction) {
  const expected = env.mainSiteApiKey || process.env.MAIN_SITE_API_KEY || "";
  if (!expected && env.nodeEnv !== "production") return next();
  const provided = req.header("x-pinuyumayan-main-site-key") ?? req.header("x-api-key") ?? "";
  if (!expected || provided !== expected) {
    return fail(res, 401, "UNAUTHORIZED", "Missing or invalid main-site API key");
  }
  return next();
}
