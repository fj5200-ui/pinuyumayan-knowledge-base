import type { Express } from "express";
import { ok, fail } from "../lib/apiResponse";
import { queryRows } from "../lib/dbQuery";
import { verifyInternalHmacV26 } from "../security/internalHmacV26";

export function registerInternalSecurityV26Routes(app: Express) {
  app.post("/api/internal/security/v26/verify-hmac", async (req, res) => {
    try {
      const result = await verifyInternalHmacV26(req);
      return result.ok ? ok(res, { version: "v26", verified: true, clientId: (result as any).clientId ?? null }) : fail(res, 401, "UNAUTHORIZED", `Invalid signature: ${(result as any).code}`);
    } catch (error) { return fail(res, 503, "DB_UNAVAILABLE", error instanceof Error ? error.message : "DB unavailable"); }
  });

  app.get("/api/ops/security/v26/hmac-failures", async (_req, res) => {
    try {
      const rows = await queryRows(`SELECT failure_code, COUNT(*) AS count FROM internal_hmac_failures_v26 WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR) GROUP BY failure_code`);
      return ok(res, { version: "v26", window: "24h", failures: rows });
    } catch (error) { return fail(res, 503, "DB_UNAVAILABLE", error instanceof Error ? error.message : "DB unavailable"); }
  });
}
