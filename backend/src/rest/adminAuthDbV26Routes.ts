import type { Express } from "express";
import { ok, fail } from "../lib/apiResponse";
import { execute, queryRows } from "../lib/dbQuery";
import { assertStrongPassword, hashPassword, verifyPassword } from "../security/passwordHash";
import { auditAdmin, createAdminSession, getAdminFromRequest, hashOptional, revokeAdminSession } from "../security/adminSessionV26";

export function registerAdminAuthDbV26Routes(app: Express) {
  app.post("/api/admin/auth/v26/login", async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) return fail(res, 400, "BAD_REQUEST", "email and password are required");
    try {
      const rows = await queryRows<any>(`SELECT * FROM admin_users WHERE email = ? LIMIT 1`, [String(email).toLowerCase()]);
      const user = rows[0];
      const valid = user && user.status !== "disabled" && verifyPassword(String(password), String(user.password_hash));
      await execute(
        `INSERT INTO admin_login_attempts (email, success, failure_reason, ip_hash, user_agent_hash, request_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [String(email).toLowerCase(), Boolean(valid), valid ? null : "invalid_credentials", hashOptional(req.ip), hashOptional(req.header("user-agent") ?? undefined), (req as any).requestId ?? null]
      );
      if (!valid) return fail(res, 401, "ADMIN_UNAUTHORIZED", "Invalid admin credentials");
      const session = await createAdminSession(Number(user.id), req);
      await execute(`UPDATE admin_users SET last_login_at = NOW() WHERE id = ?`, [user.id]);
      await auditAdmin(Number(user.id), "admin.login", { targetType: "admin_user", targetId: String(user.id) }, req);
      return ok(res, {
        version: "v26",
        token: session.token,
        admin: { id: user.id, email: user.email, displayName: user.display_name, isSuperAdmin: Boolean(user.is_super_admin), mustChangePassword: Boolean(user.must_change_password) }
      });
    } catch (error) {
      return fail(res, 503, "DB_UNAVAILABLE", error instanceof Error ? error.message : "DB unavailable");
    }
  });

  app.get("/api/admin/auth/v26/me", async (req, res) => {
    try {
      const admin = await getAdminFromRequest(req);
      if (!admin) return fail(res, 401, "ADMIN_UNAUTHORIZED", "Admin session is missing or expired");
      const roles = await queryRows<any>(`SELECT role_key FROM admin_user_roles WHERE admin_user_id = ?`, [admin.id]);
      return ok(res, { version: "v26", authenticated: true, admin: { ...admin, roles: roles.map(r => r.role_key) } });
    } catch (error) { return fail(res, 503, "DB_UNAVAILABLE", error instanceof Error ? error.message : "DB unavailable"); }
  });

  app.post("/api/admin/auth/v26/change-password", async (req, res) => {
    const { currentPassword, nextPassword } = req.body ?? {};
    try { assertStrongPassword(String(nextPassword ?? "")); }
    catch (error) { return fail(res, 400, "WEAK_PASSWORD", error instanceof Error ? error.message : "Weak password"); }
    try {
      const admin = await getAdminFromRequest(req);
      if (!admin) return fail(res, 401, "ADMIN_UNAUTHORIZED", "Admin session is missing or expired");
      const rows = await queryRows<any>(`SELECT password_hash FROM admin_users WHERE id = ? LIMIT 1`, [admin.id]);
      if (!rows[0] || !verifyPassword(String(currentPassword ?? ""), String(rows[0].password_hash))) return fail(res, 401, "ADMIN_UNAUTHORIZED", "Current password is invalid");
      await execute(`UPDATE admin_users SET password_hash = ?, must_change_password = FALSE, status = 'active' WHERE id = ?`, [hashPassword(String(nextPassword)), admin.id]);
      await auditAdmin(Number(admin.id), "admin.change_password", { targetType: "admin_user", targetId: String(admin.id) }, req);
      return ok(res, { version: "v26", changed: true });
    } catch (error) { return fail(res, 503, "DB_UNAVAILABLE", error instanceof Error ? error.message : "DB unavailable"); }
  });

  app.post("/api/admin/auth/v26/logout", async (req, res) => {
    try {
      const admin = await getAdminFromRequest(req);
      const revoked = await revokeAdminSession(req);
      if (admin) await auditAdmin(Number(admin.id), "admin.logout", { targetType: "admin_user", targetId: String(admin.id), revoked }, req);
      return ok(res, { version: "v26", revoked });
    } catch (error) { return fail(res, 503, "DB_UNAVAILABLE", error instanceof Error ? error.message : "DB unavailable"); }
  });

  app.get("/api/admin/auth/v26/bootstrap-status", async (_req, res) => {
    try {
      const rows = await queryRows<any>(`SELECT COUNT(*) AS count FROM admin_users WHERE is_super_admin = TRUE`);
      return ok(res, { version: "v26", hasSuperAdmin: Number(rows[0]?.count ?? 0) > 0 });
    } catch (error) { return fail(res, 503, "DB_UNAVAILABLE", error instanceof Error ? error.message : "DB unavailable"); }
  });
}
