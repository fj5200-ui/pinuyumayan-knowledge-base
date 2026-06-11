import type { Express } from "express";
import { ok, fail } from "../lib/apiResponse";
import { requireInternalApiKey } from "../security/apiKeyAuth";

export function registerAdminSyncRoutes(app: Express) {
  app.post("/api/internal/admin/superadmin/sync-to-main-site", requireInternalApiKey, (req, res) => {
    const { email, displayName } = req.body ?? {};
    if (!email) return fail(res, 400, "BAD_REQUEST", "email is required");
    // Implementation target: upsert main_site_superadmin_links, call main-site admin API, write audit log.
    return ok(res, { status: "queued", email, displayName: displayName ?? null, passwordSynced: false });
  });
  app.get("/api/internal/admin/superadmin/sync-status", requireInternalApiKey, (_req, res) => {
    return ok(res, { status: "placeholder", lastSyncedAt: null, pending: true });
  });
}
