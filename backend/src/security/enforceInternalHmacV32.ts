import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const seenNonces = new Map<string, number>();

function sha256Body(req: Request) {
  const raw = req.body === undefined ? "" : JSON.stringify(req.body);
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function timingSafeEqualHex(a: string, b: string) {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export function enforceInternalHmacV32() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (process.env.PINUYUMAYAN_HMAC_ENABLED !== "true") return next();
    const reportOnly = process.env.HMAC_REPORT_ONLY === "true";
    const secret = process.env.PINUYUMAYAN_HMAC_SECRET;
    const apiKey = req.header("x-pinuyumayan-main-site-key");
    const timestamp = req.header("x-pinuyumayan-timestamp");
    const nonce = req.header("x-pinuyumayan-nonce");
    const signature = req.header("x-pinuyumayan-signature");
    const expectedApiKey = process.env.MAIN_SITE_API_KEY;

    const failures: string[] = [];
    if (!secret) failures.push("missing_server_hmac_secret");
    if (expectedApiKey && apiKey !== expectedApiKey) failures.push("invalid_api_key");
    if (!timestamp) failures.push("missing_timestamp");
    if (!nonce) failures.push("missing_nonce");
    if (!signature) failures.push("missing_signature");

    const now = Date.now();
    const ts = timestamp ? Number(timestamp) : 0;
    if (timestamp && (!Number.isFinite(ts) || Math.abs(now - ts) > 300_000)) failures.push("timestamp_skew");

    if (nonce) {
      const nonceKey = `${apiKey ?? "unknown"}:${nonce}`;
      const existing = seenNonces.get(nonceKey);
      if (existing && existing > now) failures.push("replayed_nonce");
      seenNonces.set(nonceKey, now + 600_000);
      for (const [k, expiry] of Array.from(seenNonces.entries())) if (expiry < now) seenNonces.delete(k);
    }

    if (secret && timestamp && nonce && signature) {
      const canonical = [req.method.toUpperCase(), req.originalUrl, timestamp, nonce, sha256Body(req)].join("\n");
      const expected = crypto.createHmac("sha256", secret).update(canonical).digest("hex");
      if (!timingSafeEqualHex(expected, signature)) failures.push("invalid_signature");
    }

    if (failures.length) {
      const payload = { ok: false, version: "v32", error: "internal_hmac_required", failures, reportOnly };
      if (!reportOnly) return res.status(401).json(payload);
      res.setHeader("x-pinuyumayan-hmac-report-only", failures.join(","));
    }
    return next();
  };
}
