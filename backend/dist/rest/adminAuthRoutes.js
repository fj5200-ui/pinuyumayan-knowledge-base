import { randomUUID } from "node:crypto";
import { ok, fail } from "../lib/apiResponse";
import { assertStrongPassword } from "../security/passwordHash";
export function registerAdminAuthRoutes(app) {
    app.post("/api/admin/auth/login", (req, res) => {
        const { email, password } = req.body ?? {};
        if (!email || !password)
            return fail(res, 400, "BAD_REQUEST", "email and password are required");
        // Implementation target: validate admin_users.password_hash, write admin_login_attempts, create admin_sessions.
        return ok(res, { status: "placeholder", sessionId: randomUUID(), email, mustChangePassword: true });
    });
    app.post("/api/admin/auth/change-password", (req, res) => {
        const { nextPassword } = req.body ?? {};
        try {
            assertStrongPassword(String(nextPassword ?? ""));
        }
        catch (error) {
            return fail(res, 400, "WEAK_PASSWORD", error instanceof Error ? error.message : "Weak password");
        }
        return ok(res, { status: "placeholder", rotated: true });
    });
    app.get("/api/admin/auth/me", (_req, res) => ok(res, { status: "placeholder", authenticated: false }));
    app.post("/api/admin/auth/logout", (_req, res) => ok(res, { status: "placeholder", revoked: true }));
}
