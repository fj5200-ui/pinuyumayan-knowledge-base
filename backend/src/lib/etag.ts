import { createHash } from "crypto";
import type { Request, Response } from "express";

export function createWeakEtag(payload: unknown): string {
  const json = typeof payload === "string" ? payload : JSON.stringify(payload ?? null);
  const hash = createHash("sha256").update(json).digest("hex").slice(0, 24);
  return `W/"${hash}"`;
}

export function sendJsonWithEtag(req: Request, res: Response, payload: unknown, maxAgeSeconds = 60) {
  const etag = createWeakEtag(payload);
  res.setHeader("etag", etag);
  res.setHeader("cache-control", `public, max-age=${maxAgeSeconds}, stale-while-revalidate=86400`);
  if (req.headers["if-none-match"] === etag) {
    return res.status(304).end();
  }
  return res.json(payload);
}
