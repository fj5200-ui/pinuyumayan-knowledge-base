import type { Express } from "express";
import { ok, fail } from "../lib/apiResponse";
import { execute, queryRows } from "../lib/dbQuery";
import { requireInternalHmacV26 } from "../security/internalHmacV26";
import { assertProductionDbFallbackPolicyV27 } from "../lib/dataModeV27";

export function registerVpsStagingV27Routes(app: Express) {
  app.get("/api/ops/data-mode/v27/status", async (_req, res) => {
    return ok(res, assertProductionDbFallbackPolicyV27());
  });

  app.get("/api/ops/db-fallback/v27/events", async (_req, res) => {
    try {
      const rows = await queryRows(`SELECT route_path, route_group, environment, fallback_source, blocked, created_at FROM db_fallback_events_v27 ORDER BY created_at DESC LIMIT 50`);
      return ok(res, { version: "v27", events: rows });
    } catch (error) { return fail(res, 503, "DB_UNAVAILABLE", error instanceof Error ? error.message : "DB unavailable"); }
  });

  app.get("/api/admin/corpus/v27/acceptance-latest", async (_req, res) => {
    try {
      const rows = await queryRows(`SELECT * FROM full_corpus_acceptance_metrics_v27 ORDER BY created_at DESC LIMIT 1`);
      return ok(res, { version: "v27", latest: rows[0] ?? null, embeddedPreviewOnly: !rows.length });
    } catch (error) { return fail(res, 503, "DB_UNAVAILABLE", error instanceof Error ? error.message : "DB unavailable"); }
  });

  app.post("/api/internal/corpus/v27/acceptance-report", requireInternalHmacV26, async (req, res) => {
    try {
      const body = req.body ?? {};
      const reportKey = String(body.reportKey ?? `report-${Date.now()}`);
      const totalEntries = Number(body.totalEntries ?? 0);
      const requiredMinEntries = Number(body.requiredMinEntries ?? 1000);
      const status = totalEntries >= requiredMinEntries && Number(body.licenseBlockerCount ?? 0) === 0 ? "passed" : "failed";
      await execute(
        `INSERT INTO full_corpus_acceptance_metrics_v27
        (report_key, job_key, total_entries, required_min_entries, dialect_count_json, audio_asset_count, audio_coverage_ratio, source_phon_count, source_phon_coverage_ratio, duplicate_count, license_blocker_count, public_candidate_count, status, report_json)
        VALUES (?, ?, ?, ?, CAST(? AS JSON), ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS JSON))
        ON DUPLICATE KEY UPDATE total_entries=VALUES(total_entries), required_min_entries=VALUES(required_min_entries), dialect_count_json=VALUES(dialect_count_json), audio_asset_count=VALUES(audio_asset_count), audio_coverage_ratio=VALUES(audio_coverage_ratio), source_phon_count=VALUES(source_phon_count), source_phon_coverage_ratio=VALUES(source_phon_coverage_ratio), duplicate_count=VALUES(duplicate_count), license_blocker_count=VALUES(license_blocker_count), public_candidate_count=VALUES(public_candidate_count), status=VALUES(status), report_json=VALUES(report_json)`,
        [reportKey, body.jobKey ?? null, totalEntries, requiredMinEntries, JSON.stringify(body.dialectCounts ?? {}), Number(body.audioAssetCount ?? 0), body.audioCoverageRatio ?? null, Number(body.sourcePhonCount ?? 0), body.sourcePhonCoverageRatio ?? null, Number(body.duplicateCount ?? 0), Number(body.licenseBlockerCount ?? 0), Number(body.publicCandidateCount ?? 0), status, JSON.stringify(body)]
      );
      return ok(res, { version: "v27", recorded: true, reportKey, status });
    } catch (error) { return fail(res, 503, "DB_UNAVAILABLE", error instanceof Error ? error.message : "DB unavailable"); }
  });

  app.get("/api/ops/search/v27/index-status", async (_req, res) => {
    try {
      const counts = await queryRows<any>(`SELECT release_channel, COUNT(*) AS count FROM search_index_documents_v27 GROUP BY release_channel`);
      const runs = await queryRows(`SELECT run_key, adapter_key, status, document_count, created_at, finished_at FROM search_rebuild_runs_v27 ORDER BY created_at DESC LIMIT 10`);
      return ok(res, { version: "v27", adapter: process.env.SEARCH_ADAPTER ?? "mysql_fulltext", counts, runs });
    } catch (error) { return fail(res, 503, "DB_UNAVAILABLE", error instanceof Error ? error.message : "DB unavailable"); }
  });

  app.post("/api/internal/search/v27/rebuild", requireInternalHmacV26, async (req, res) => {
    try {
      const runKey = String(req.body?.runKey ?? `search-rebuild-${Date.now()}`);
      await execute(`INSERT INTO search_rebuild_runs_v27 (run_key, adapter_key, status, started_at) VALUES (?, ?, 'queued', NOW()) ON DUPLICATE KEY UPDATE status='queued', started_at=NOW()`, [runKey, process.env.SEARCH_ADAPTER ?? "mysql_fulltext"]);
      return ok(res, { version: "v27", queued: true, runKey });
    } catch (error) { return fail(res, 503, "DB_UNAVAILABLE", error instanceof Error ? error.message : "DB unavailable"); }
  });

  app.get("/api/ops/vps-db/v27/restore-drills", async (_req, res) => {
    try {
      const rows = await queryRows(`SELECT drill_key, backup_key, restore_target, status, restore_started_at, restore_finished_at, verified_at, created_at FROM vps_backup_restore_drills_v27 ORDER BY created_at DESC LIMIT 20`);
      return ok(res, { version: "v27", drills: rows });
    } catch (error) { return fail(res, 503, "DB_UNAVAILABLE", error instanceof Error ? error.message : "DB unavailable"); }
  });

  app.post("/api/internal/vps-db/v27/restore-drill-report", requireInternalHmacV26, async (req, res) => {
    try {
      const { drillKey, backupKey, restoreTarget, status, rowCountChecks, checksumChecks, operatorLabel, notes } = req.body ?? {};
      if (!drillKey || !backupKey || !restoreTarget) return fail(res, 400, "BAD_REQUEST", "drillKey, backupKey and restoreTarget are required");
      await execute(
        `INSERT INTO vps_backup_restore_drills_v27 (drill_key, backup_key, restore_target, status, row_count_checks_json, checksum_checks_json, restore_started_at, restore_finished_at, verified_at, operator_label, notes)
         VALUES (?, ?, ?, ?, CAST(? AS JSON), CAST(? AS JSON), NOW(), IF(? IN ('restored','verified','failed'), NOW(), NULL), IF(?='verified', NOW(), NULL), ?, ?)
         ON DUPLICATE KEY UPDATE status=VALUES(status), row_count_checks_json=VALUES(row_count_checks_json), checksum_checks_json=VALUES(checksum_checks_json), restore_finished_at=VALUES(restore_finished_at), verified_at=VALUES(verified_at), operator_label=VALUES(operator_label), notes=VALUES(notes)`,
        [drillKey, backupKey, restoreTarget, status ?? "started", JSON.stringify(rowCountChecks ?? {}), JSON.stringify(checksumChecks ?? {}), status ?? "started", status ?? "started", operatorLabel ?? null, notes ?? null]
      );
      return ok(res, { version: "v27", recorded: true, drillKey, status: status ?? "started" });
    } catch (error) { return fail(res, 503, "DB_UNAVAILABLE", error instanceof Error ? error.message : "DB unavailable"); }
  });

  app.get("/api/ops/source-candidates/v27/ingestion-runs", async (_req, res) => {
    try {
      const rows = await queryRows(`SELECT run_key, adapter_key, status, candidate_count, blocked_count, output_file, created_at, finished_at FROM source_candidate_ingestion_runs_v27 ORDER BY created_at DESC LIMIT 20`);
      return ok(res, { version: "v27", policy: "candidate_only_not_auto_public", runs: rows });
    } catch (error) { return fail(res, 503, "DB_UNAVAILABLE", error instanceof Error ? error.message : "DB unavailable"); }
  });

  app.get("/api/ops/next-upgrade-plan/v28", (_req, res) => {
    res.json({ ok: true, version: "v28", planFile: "data/development/next_upgrade_plan_v28.json" });
  });
}
