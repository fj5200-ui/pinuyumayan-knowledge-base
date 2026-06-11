import type { Express } from "express";
import { getMainSiteInstallManifestV25, getMigrationReadinessV25 } from "../modules/mainSiteMigrationV25/service";

export function registerMainSiteMigrationV25Routes(app: Express) {
  app.get("/api/public/main-site/v25/install-manifest", (_req, res) => res.json(getMainSiteInstallManifestV25()));
  app.get("/api/ops/main-site/v25/migration-readiness", (_req, res) => res.json(getMigrationReadinessV25()));
  app.post("/api/internal/corpus/v25/acceptance-report", (req, res) => {
    res.json({ ok: true, version: "v25", status: "acceptance_report_received", importRunId: req.body?.importRunId ?? null });
  });
  app.get("/api/admin/corpus/v25/acceptance-latest", (_req, res) => {
    res.json({ version: "v25", status: "not_run_in_package", note: "Run full corpus import in deployment to produce the real acceptance report." });
  });
  app.get("/api/ops/next-upgrade-plan/v26", (_req, res) => {
    res.json({ version: "v26", title: "主站實際搬移 + 審核流程接資料庫 + 千筆語料實測匯入" });
  });
}
