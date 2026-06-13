import type { Express } from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pool } from "../db/client";

function rootDir() {
  return process.cwd().endsWith("backend") ? path.resolve(process.cwd(), "..") : process.cwd();
}
function readJson(rel: string) {
  return JSON.parse(fs.readFileSync(path.join(rootDir(), rel), "utf8"));
}
function sha(input: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(input ?? {})).digest("hex");
}
const blockedTerms = ["卑南文化遺址", "卑南遺址", "卑南考古遺址", "卑南文化公園", "Peinan Site", "Beinan Site", "Peinan Archaeological Site"];
const allowedWorkbenchActions = new Set(["assign", "upload_evidence", "return_for_fix", "reject", "approve_gate", "import_alignment"]);
function guardText(body: unknown) {
  const text = JSON.stringify(body ?? {});
  const blocked = blockedTerms.filter((term) => text.includes(term));
  return { ok: blocked.length === 0, blocked, request_hash: sha(body) };
}
async function withMysqlTransaction<T>(work: (conn: any) => Promise<T>) {
  if (!pool) return { db_mode: "contract_only_database_url_missing" as const, committed: false as const, result: null as T | null };
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return { db_mode: "mysql_transaction" as const, committed: true as const, result };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export function registerTtsSttMusicV49Routes(app: Express) {
  app.get("/api/admin/music-speech/v49/review-center", (_req, res) => res.json(readJson("data/admin/music_speech_review_center_v49.json")));
  app.get("/api/ops/vps/v49/release-validation-report", (_req, res) => res.json(readJson("data/database/vps_release_validation_report_v49.json")));
  app.post("/api/internal/vps/v49/record-release-validation", async (req, res) => {
    const body = req.body ?? {};
    const guard = guardText(body);
    if (!body.run_id || !guard.ok) return res.status(400).json({ ok: false, version: "v49", error: "invalid_release_validation_payload", blocked_terms: guard.blocked });
    try {
      const tx = await withMysqlTransaction(async (conn) => {
        await conn.execute("INSERT INTO vps_release_validation_runs_v49 (run_id, run_mode, status, migration_checksum, seed_checksum, backup_id, release_allowed, report_json) VALUES (?,?,?,?,?,?,FALSE,CAST(? AS JSON)) ON DUPLICATE KEY UPDATE status=VALUES(status), migration_checksum=VALUES(migration_checksum), seed_checksum=VALUES(seed_checksum), backup_id=VALUES(backup_id), report_json=VALUES(report_json)", [body.run_id, body.run_mode ?? "vps_live", body.status ?? "recorded", body.migration_checksum ?? null, body.seed_checksum ?? null, body.backup_id ?? null, JSON.stringify(body)]);
        for (const [idx, check] of (Array.isArray(body.checks) ? body.checks : []).entries()) {
          await conn.execute("INSERT IGNORE INTO vps_release_validation_checks_v49 (result_id, run_id, check_id, status, severity, evidence_url, check_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [`release-check-v49-${guard.request_hash.slice(0, 8)}-${idx}`, body.run_id, check.check_id ?? `check-${idx}`, check.status ?? "pending", check.severity ?? "required", check.evidence_url ?? null, JSON.stringify(check)]);
        }
        return { run_id: body.run_id, checks_recorded: Array.isArray(body.checks) ? body.checks.length : 0 };
      });
      res.json({ ok: true, accepted: true, version: "v49", ...tx, release_allowed: false });
    } catch (error) {
      res.status(500).json({ ok: false, version: "v49", error: "record_release_validation_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
    }
  });
  app.post("/api/internal/vps/v49/record-backup-restore-drill", async (req, res) => {
    const body = req.body ?? {};
    const guard = guardText(body);
    if (!body.actor_id || !body.backup_id || !body.restore_target || !guard.ok) return res.status(400).json({ ok: false, version: "v49", error: "invalid_backup_restore_drill", blocked_terms: guard.blocked });
    try {
      const tx = await withMysqlTransaction(async (conn) => {
        const drillId = body.drill_id ?? `backup-restore-v49-${guard.request_hash.slice(0, 16)}`;
        await conn.execute("INSERT IGNORE INTO vps_backup_restore_drills_v49 (drill_id, actor_id, backup_id, restore_target, status, duration_seconds, drill_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [drillId, body.actor_id, body.backup_id, body.restore_target, body.status ?? "recorded", Number(body.duration_seconds ?? 0), JSON.stringify(body)]);
        return { drill_id: drillId };
      });
      res.json({ ok: true, accepted: true, version: "v49", ...tx });
    } catch (error) {
      res.status(500).json({ ok: false, version: "v49", error: "backup_restore_drill_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/admin/music-speech/v49/live-workbench", (_req, res) => res.json(readJson("data/admin/speech_review_workbench_live_api_v49.json")));
  app.post("/api/internal/speech-training/v49/workbench-action", async (req, res) => {
    const body = req.body ?? {};
    const action = String(body.action_type ?? "");
    const guard = guardText(body);
    if (!body.actor_id || !body.queue_id || !body.idempotency_key || !allowedWorkbenchActions.has(action) || !guard.ok) return res.status(400).json({ ok: false, version: "v49", error: "invalid_workbench_action", allowed_actions: [...allowedWorkbenchActions], blocked_terms: guard.blocked });
    if (action === "approve_gate" && body.evidence_complete !== true) return res.status(400).json({ ok: false, version: "v49", error: "approve_gate_requires_evidence_complete" });
    try {
      const tx = await withMysqlTransaction(async (conn) => {
        const actionId = `workbench-action-v49-${guard.request_hash.slice(0, 16)}`;
        await conn.execute("INSERT IGNORE INTO speech_review_workbench_live_actions_v49 (action_id, queue_id, actor_id, action_type, idempotency_key, request_hash, action_json, public_release_allowed) VALUES (?,?,?,?,?,?,CAST(? AS JSON),FALSE)", [actionId, body.queue_id, body.actor_id, action, body.idempotency_key, guard.request_hash, JSON.stringify(body)]);
        await conn.execute("INSERT INTO speech_review_workbench_live_views_v49 (queue_id, asset_id, assigned_reviewer, status, attachment_scan_status, role_visibility_json) VALUES (?,?,?,?,?,CAST(? AS JSON)) ON DUPLICATE KEY UPDATE assigned_reviewer=VALUES(assigned_reviewer), status=VALUES(status), attachment_scan_status=VALUES(attachment_scan_status), role_visibility_json=VALUES(role_visibility_json)", [body.queue_id, body.asset_id ?? "unknown", body.assigned_reviewer ?? null, body.next_status ?? action, body.attachment_scan_status ?? "not_uploaded", JSON.stringify(body.role_visibility ?? ["super_admin", "speech_review_lead"])]);
        return { action_id: actionId };
      });
      res.json({ ok: true, accepted: true, version: "v49", ...tx, public_release_allowed: false });
    } catch (error) {
      res.status(500).json({ ok: false, version: "v49", error: "workbench_action_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
    }
  });
  app.post("/api/internal/speech-training/v49/attachment-scan-status", async (req, res) => {
    const body = req.body ?? {};
    const guard = guardText(body);
    if (!body.actor_id || !body.queue_id || !body.attachment_id || !body.scan_status || !guard.ok) return res.status(400).json({ ok: false, version: "v49", error: "invalid_attachment_scan_status", blocked_terms: guard.blocked });
    try {
      const tx = await withMysqlTransaction(async (conn) => {
        const scanJobId = body.scan_job_id ?? `attachment-scan-v49-${guard.request_hash.slice(0, 16)}`;
        await conn.execute("INSERT IGNORE INTO speech_review_attachment_scan_jobs_v49 (scan_job_id, queue_id, attachment_id, actor_id, scan_status, scanner, scan_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [scanJobId, body.queue_id, body.attachment_id, body.actor_id, body.scan_status, body.scanner ?? "configured_scanner", JSON.stringify(body)]);
        return { scan_job_id: scanJobId };
      });
      res.json({ ok: true, accepted: true, version: "v49", ...tx });
    } catch (error) {
      res.status(500).json({ ok: false, version: "v49", error: "attachment_scan_status_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
    }
  });
  app.post("/api/internal/speech-training/v49/batch-progress", async (req, res) => {
    const body = req.body ?? {};
    const guard = guardText(body);
    if (!body.actor_id || !body.batch_id || !guard.ok) return res.status(400).json({ ok: false, version: "v49", error: "invalid_batch_progress", blocked_terms: guard.blocked });
    try {
      const tx = await withMysqlTransaction(async (conn) => {
        await conn.execute("INSERT INTO speech_review_batch_progress_v49 (batch_id, actor_id, status, total_count, processed_count, failed_count, progress_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON)) ON DUPLICATE KEY UPDATE status=VALUES(status), processed_count=VALUES(processed_count), failed_count=VALUES(failed_count), progress_json=VALUES(progress_json)", [body.batch_id, body.actor_id, body.status ?? "running", Number(body.total_count ?? 0), Number(body.processed_count ?? 0), Number(body.failed_count ?? 0), JSON.stringify(body)]);
        return { batch_id: body.batch_id };
      });
      res.json({ ok: true, accepted: true, version: "v49", ...tx });
    } catch (error) {
      res.status(500).json({ ok: false, version: "v49", error: "batch_progress_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/ops/search/music/v49/auto-optimization", (_req, res) => res.json(readJson("data/search/music_search_auto_optimization_v49.json")));
  app.post("/api/internal/search/music/v49/apply-synonym-suggestion", async (req, res) => {
    const body = req.body ?? {};
    const guard = guardText(body);
    if (!body.suggestion_id || !body.actor_id || body.manual_review_passed !== true || !guard.ok) return res.status(400).json({ ok: false, version: "v49", error: "synonym_apply_requires_manual_review", blocked_terms: guard.blocked });
    try {
      const tx = await withMysqlTransaction(async (conn) => {
        await conn.execute("UPDATE music_search_synonym_suggestions_v49 SET status='approved', reviewer_id=?, applied=TRUE WHERE suggestion_id=?", [body.actor_id, body.suggestion_id]);
        return { suggestion_id: body.suggestion_id };
      });
      res.json({ ok: true, accepted: true, version: "v49", ...tx });
    } catch (error) {
      res.status(500).json({ ok: false, version: "v49", error: "apply_synonym_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
    }
  });
  app.post("/api/internal/search/music/v49/record-regression-run", async (req, res) => {
    const body = req.body ?? {};
    const guard = guardText(body);
    if (!body.run_id || !guard.ok) return res.status(400).json({ ok: false, version: "v49", error: "invalid_regression_run", blocked_terms: guard.blocked });
    try {
      const tx = await withMysqlTransaction(async (conn) => {
        await conn.execute("INSERT IGNORE INTO music_search_regression_runs_v49 (run_id, actor_id, status, cases_total, cases_passed, cases_failed, run_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [body.run_id, body.actor_id ?? null, body.status ?? "recorded", Number(body.cases_total ?? 0), Number(body.cases_passed ?? 0), Number(body.cases_failed ?? 0), JSON.stringify(body)]);
        return { run_id: body.run_id };
      });
      res.json({ ok: true, accepted: true, version: "v49", ...tx });
    } catch (error) {
      res.status(500).json({ ok: false, version: "v49", error: "record_regression_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/ops/authority-sources/v49/citation-completeness", (_req, res) => res.json(readJson("data/integration/authority_citation_completeness_v49.json")));
  app.post("/api/internal/authority-sources/v49/approve-metadata-only", async (req, res) => {
    const body = req.body ?? {};
    const guard = guardText(body);
    if (!body.actor_id || !body.candidate_id || body.citation_score_passed !== true || body.rights_review_passed !== true || !guard.ok) return res.status(400).json({ ok: false, version: "v49", error: "metadata_only_approval_requires_citation_and_rights_review", blocked_terms: guard.blocked });
    try {
      const tx = await withMysqlTransaction(async (conn) => {
        const scoreId = `metadata-approve-v49-${guard.request_hash.slice(0, 16)}`;
        await conn.execute("INSERT IGNORE INTO authority_citation_completeness_scores_v49 (score_id, candidate_id, citation_score, rights_statement_score, metadata_completeness_score, publish_recommendation, public_audio_allowed, public_lyrics_allowed, score_json) VALUES (?,?,?,?,?,?,FALSE,FALSE,CAST(? AS JSON))", [scoreId, body.candidate_id, Number(body.citation_score ?? 0), Number(body.rights_statement_score ?? 0), Number(body.metadata_completeness_score ?? 0), "metadata_only_approved", JSON.stringify(body)]);
        return { score_id: scoreId, candidate_id: body.candidate_id };
      });
      res.json({ ok: true, accepted: true, version: "v49", ...tx, public_audio_allowed: false, public_lyrics_allowed: false });
    } catch (error) {
      res.status(500).json({ ok: false, version: "v49", error: "metadata_only_approval_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
    }
  });
  app.post("/api/internal/authority-sources/v49/source-change-event", async (req, res) => {
    const body = req.body ?? {};
    const guard = guardText(body);
    if (!body.source_id || !body.event_type || !guard.ok) return res.status(400).json({ ok: false, version: "v49", error: "invalid_source_change_event", blocked_terms: guard.blocked });
    try {
      const tx = await withMysqlTransaction(async (conn) => {
        const eventId = body.event_id ?? `source-change-v49-${guard.request_hash.slice(0, 16)}`;
        await conn.execute("INSERT IGNORE INTO authority_source_change_events_v49 (event_id, source_id, event_type, etag, last_modified, event_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [eventId, body.source_id, body.event_type, body.etag ?? null, body.last_modified ?? null, JSON.stringify(body)]);
        return { event_id: eventId };
      });
      res.json({ ok: true, accepted: true, version: "v49", ...tx });
    } catch (error) {
      res.status(500).json({ ok: false, version: "v49", error: "source_change_event_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/ops/speech-training/v49/governance-export", (_req, res) => res.json(readJson("data/audio/speech_model_governance_export_v49.json")));
  app.post("/api/internal/speech-training/v49/export-model-governance", async (req, res) => {
    const body = req.body ?? {};
    const guard = guardText(body);
    if (!body.actor_id || !body.export_format || !guard.ok) return res.status(400).json({ ok: false, version: "v49", error: "invalid_model_governance_export", blocked_terms: guard.blocked });
    try {
      const tx = await withMysqlTransaction(async (conn) => {
        const exportId = body.export_id ?? `model-governance-export-v49-${guard.request_hash.slice(0, 16)}`;
        await conn.execute("INSERT IGNORE INTO speech_model_governance_exports_v49 (export_id, actor_id, export_format, status, artifact_path, export_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [exportId, body.actor_id, body.export_format, body.status ?? "generated", body.artifact_path ?? null, JSON.stringify(body)]);
        return { export_id: exportId };
      });
      res.json({ ok: true, accepted: true, version: "v49", ...tx, public_release_allowed: false });
    } catch (error) {
      res.status(500).json({ ok: false, version: "v49", error: "model_governance_export_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/ops/site/v49/design-system-performance", (_req, res) => res.json(readJson("data/site/main_site_design_system_performance_v49.json")));
  app.post("/api/internal/site/v49/record-performance-validation", async (req, res) => {
    const body = req.body ?? {};
    const guard = guardText(body);
    if (!body.route_path || !guard.ok) return res.status(400).json({ ok: false, version: "v49", error: "invalid_performance_validation", blocked_terms: guard.blocked });
    try {
      const tx = await withMysqlTransaction(async (conn) => {
        const runId = body.run_id ?? `site-performance-v49-${guard.request_hash.slice(0, 16)}`;
        await conn.execute("INSERT IGNORE INTO site_performance_validation_runs_v49 (run_id, route_path, lcp_ms, inp_ms, cls, status, run_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [runId, body.route_path, Number(body.lcp_ms ?? 0), Number(body.inp_ms ?? 0), Number(body.cls ?? 0), body.status ?? "recorded", JSON.stringify(body)]);
        return { run_id: runId };
      });
      res.json({ ok: true, accepted: true, version: "v49", ...tx });
    } catch (error) {
      res.status(500).json({ ok: false, version: "v49", error: "performance_validation_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
    }
  });
  app.post("/api/internal/site/v49/record-og-screenshot-validation", async (req, res) => {
    const body = req.body ?? {};
    const guard = guardText(body);
    if (!body.route_path || !body.status || !guard.ok) return res.status(400).json({ ok: false, version: "v49", error: "invalid_og_screenshot_validation", blocked_terms: guard.blocked });
    try {
      const tx = await withMysqlTransaction(async (conn) => {
        const validationId = body.validation_id ?? `og-screenshot-v49-${guard.request_hash.slice(0, 16)}`;
        await conn.execute("INSERT IGNORE INTO site_og_screenshot_validations_v49 (validation_id, route_path, screenshot_path, status, validation_json) VALUES (?,?,?,?,CAST(? AS JSON))", [validationId, body.route_path, body.screenshot_path ?? null, body.status, JSON.stringify(body)]);
        return { validation_id: validationId };
      });
      res.json({ ok: true, accepted: true, version: "v49", ...tx });
    } catch (error) {
      res.status(500).json({ ok: false, version: "v49", error: "og_screenshot_validation_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
    }
  });
  app.get("/api/ops/vps/v49/preflight-contract", (_req, res) => res.json(readJson("data/ops/vps_preflight_v49.json")));
  app.get("/api/ops/next-upgrade-plan/v50", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v50.json")));
}
