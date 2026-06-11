import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { fail } from "../lib/apiResponse";
import { execute, queryRows } from "../lib/dbQuery";

const REQUIRED_HEADERS = ["x-pinuyumayan-main-site-key", "x-pinuyumayan-client-id", "x-pinuyumayan-timestamp", "x-pinuyumayan-nonce", "x-pinuyumayan-signature"];
const SKEW_MS = 5 * 60 * 1000;

export function sha256HexV26(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function signatureBaseV26(req: Request) {
  const timestamp = String(req.header("x-pinuyumayan-timestamp") ?? "");
  const nonce = String(req.header("x-pinuyumayan-nonce") ?? "");
  const bodyHash = sha256HexV26(JSON.stringify(req.body ?? {}));
  return [req.method.toUpperCase(), req.originalUrl, timestamp, nonce, bodyHash].join("\n");
}

async function auditFailure(req: Request, failureCode: string) {
  try {
    await execute(
      `INSERT INTO internal_hmac_failures_v26 (client_id, failure_code, request_path, request_method, ip_hash, user_agent_hash, request_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.header("x-pinuyumayan-client-id") ?? null, failureCode, req.originalUrl, req.method, sha256HexV26(req.ip ?? ""), sha256HexV26(req.header("user-agent") ?? ""), (req as any).requestId ?? null]
    );
  } catch { /* audit must never crash the request */ }
}

export async function verifyInternalHmacV26(req: Request) {
  if (process.env.PINUYUMAYAN_HMAC_ENABLED === "false") return { ok: true, bypassed: true };
  for (const h of REQUIRED_HEADERS) if (!req.header(h)) return { ok: false, code: "missing_header" };
  if (req.header("x-pinuyumayan-main-site-key") !== process.env.MAIN_SITE_API_KEY && req.header("x-pinuyumayan-main-site-key") !== process.env.PINUYUMAYAN_MAIN_SITE_API_KEY) {
    return { ok: false, code: "invalid_api_key" };
  }
  const timestamp = Number(req.header("x-pinuyumayan-timestamp"));
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() - timestamp) > SKEW_MS) return { ok: false, code: "timestamp_skew" };
  const secret = process.env.PINUYUMAYAN_HMAC_SECRET ?? "";
  if (!secret) return { ok: false, code: "missing_server_secret" };
  const base = signatureBaseV26(req);
  const expected = crypto.createHmac("sha256", secret).update(base).digest("hex");
  const provided = String(req.header("x-pinuyumayan-signature") ?? "");
  const valid = provided.length === expected.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
  if (!valid) return { ok: false, code: "invalid_signature" };
  const clientId = String(req.header("x-pinuyumayan-client-id"));
  const nonce = String(req.header("x-pinuyumayan-nonce"));
  const existing = await queryRows(`SELECT id FROM internal_api_nonces_v26 WHERE client_id = ? AND nonce = ? LIMIT 1`, [clientId, nonce]);
  if (existing.length) return { ok: false, code: "nonce_reused" };
  await execute(
    `INSERT INTO internal_api_nonces_v26 (client_id, nonce, request_timestamp_ms, request_path, request_method, expires_at)
     VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
    [clientId, nonce, timestamp, req.originalUrl, req.method]
  );
  return { ok: true, clientId };
}

export function requireInternalHmacV26(req: Request, res: Response, next: NextFunction) {
  verifyInternalHmacV26(req)
    .then(result => {
      if (result.ok) return next();
      auditFailure(req, String((result as any).code ?? "unknown")).finally(() => {
        const code = String((result as any).code ?? "invalid_hmac");
        fail(res, code === "nonce_reused" ? 409 : 401, "UNAUTHORIZED", `Invalid internal API signature: ${code}`);
      });
    })
    .catch(error => fail(res, 503, "DB_UNAVAILABLE", error instanceof Error ? error.message : "DB unavailable"));
}
