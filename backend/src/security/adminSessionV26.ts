import crypto from "node:crypto";
import type { Request } from "express";
import { execute, queryRows } from "../lib/dbQuery";

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function hashOptional(value: string | undefined) {
  return value ? crypto.createHash("sha256").update(value).digest("hex") : null;
}

export function readBearerToken(req: Request) {
  const auth = req.header("authorization") ?? "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export async function createAdminSession(adminUserId: number, req: Request, ttlHours = 12) {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  await execute(
    `INSERT INTO admin_sessions (admin_user_id, session_token_hash, request_id, ip_hash, user_agent_hash, expires_at)
     VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR))`,
    [adminUserId, tokenHash, (req as any).requestId ?? null, hashOptional(req.ip), hashOptional(req.header("user-agent") ?? undefined), ttlHours]
  );
  return { token, tokenHash };
}

export async function getAdminFromRequest(req: Request) {
  const token = readBearerToken(req);
  if (!token) return null;
  const rows = await queryRows<any>(
    `SELECT u.id, u.email, u.display_name, u.status, u.is_super_admin, u.must_change_password, s.id AS session_id
     FROM admin_sessions s
     JOIN admin_users u ON u.id = s.admin_user_id
     WHERE s.session_token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > NOW()
     LIMIT 1`,
    [hashToken(token)]
  );
  return rows[0] ?? null;
}

export async function revokeAdminSession(req: Request) {
  const token = readBearerToken(req);
  if (!token) return false;
  const result = await execute(`UPDATE admin_sessions SET revoked_at = NOW() WHERE session_token_hash = ? AND revoked_at IS NULL`, [hashToken(token)]);
  return (result?.affectedRows ?? 0) > 0;
}

export async function auditAdmin(actorAdminUserId: number | null, action: string, metadata: Record<string, unknown>, req: Request) {
  await execute(
    `INSERT INTO admin_auth_audit_logs (actor_admin_user_id, action, target_type, target_id, request_id, metadata_json)
     VALUES (?, ?, ?, ?, ?, CAST(? AS JSON))`,
    [actorAdminUserId, action, String(metadata.targetType ?? "admin"), String(metadata.targetId ?? ""), (req as any).requestId ?? null, JSON.stringify(metadata)]
  );
}
