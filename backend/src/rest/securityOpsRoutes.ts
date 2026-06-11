import type { Express } from "express";

export function registerSecurityOpsRoutes(app: Express) {
  app.get("/api/admin/security/sessions", async (_req, res) => {
    res.json({ ok: true, data: { items: [] } });
  });
  app.post("/api/admin/security/mfa/enroll", async (_req, res) => {
    res.json({ ok: true, data: { status: "not_implemented", message: "MFA enrollment scaffold added in v14." } });
  });
}
