import type { Express } from "express";
import { requireApiScopes } from "../security/apiScopes";
import { sendJsonWithEtag } from "../lib/etag";

export function registerExportRoutes(app: Express) {
  app.get("/api/public/knowledge/export/latest", (req, res) => {
    return sendJsonWithEtag(req, res, {
      ok: true,
      bundleType: req.query.type ?? "main_site_bootstrap",
      status: "not_generated_in_skeleton",
      message: "Export artifact endpoint is defined. Production implementation should return latest generated public-safe artifact manifest.",
      fullCorpusImportAtStartup: false
    }, 300);
  });

  app.post("/api/internal/exports/bundle/enqueue", requireApiScopes(["export:write"]), (req, res) => {
    const bundleType = req.body?.bundleType ?? "main_site_bootstrap";
    return res.status(202).json({ ok: true, jobType: "export_bundle", bundleType, status: "queued" });
  });
}
