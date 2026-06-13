import type { Express } from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pool } from "../db/client";

function rootDir() { return process.cwd().endsWith("backend") ? path.resolve(process.cwd(), "..") : process.cwd(); }
function readJson(rel: string) { return JSON.parse(fs.readFileSync(path.join(rootDir(), rel), "utf8")); }
function sha(input: unknown) { return crypto.createHash("sha256").update(JSON.stringify(input ?? {})).digest("hex"); }
const blockedTerms = ["卑南文化遺址", "卑南遺址", "卑南考古遺址", "卑南文化公園", "Peinan Site", "Beinan Site", "Peinan Archaeological Site"];
function guardText(body: unknown) { const text = JSON.stringify(body ?? {}); const blocked = blockedTerms.filter((term) => text.includes(term)); return { ok: blocked.length === 0, blocked, request_hash: sha(body) }; }
async function withMysqlTransaction<T>(work: (conn: any) => Promise<T>) {
  if (!pool) return { db_mode: "contract_only_database_url_missing" as const, committed: false as const, result: null as T | null };
  const conn = await pool.getConnection();
  try { await conn.beginTransaction(); const result = await work(conn); await conn.commit(); return { db_mode: "mysql_transaction" as const, committed: true as const, result }; }
  catch (error) { await conn.rollback(); throw error; }
  finally { conn.release(); }
}
function id(prefix: string, body: unknown) { return `${prefix}-${sha(body).slice(0,16)}`; }
function jsonColumn(table: string) {
  if (table.includes("site_ops_reports")) return "report_json";
  if (table.includes("site_alert_notifications")) return "alert_json";
  if (table.includes("site_")) return "sample_json";
  if (table.includes("authority_metadata_public_cards")) return "metadata_json";
  if (table.includes("authority_metadata_source_changes")) return "change_json";
  if (table.includes("authority_metadata_takedown")) return "test_json";
  if (table.includes("speech_model_governance_pdfs")) return "pdf_json";
  if (table.includes("speech_model_release_blockers")) return "blocker_json";
  if (table.includes("speech_model")) return "section_json";
  if (table.includes("legal_speech_exports")) return "export_json";
  if (table.includes("legal_speech_asset")) return "approval_json";
  if (table.includes("legal_speech_evidence")) return "file_json";
  if (table.includes("music_search_synonym")) return "task_json";
  if (table.includes("music_search_ranking_metrics")) return "metric_json";
  if (table.includes("music_search")) return "rollout_json";
  if (table.includes("production_backfill")) return "seal_json";
  if (table.includes("dns") || table.includes("backup")) return "evidence_json";
  if (table.includes("observation")) return "observation_json";
  return "check_json";
}
async function writeEvent(table: string, key: string, value: string, body: unknown) {
  return withMysqlTransaction(async (conn) => {
    const jsonCol = jsonColumn(table);
    await conn.execute(`INSERT IGNORE INTO ${table} (${key}, actor_id, status, ${jsonCol}) VALUES (?,?,?,CAST(? AS JSON))`, [value, (body as any).actor_id ?? "system", (body as any).status ?? "recorded", JSON.stringify(body)]);
    return { [key]: value };
  });
}

export function registerTtsSttMusicV53Routes(app: Express) {
  app.get("/api/admin/music-speech/v53/review-center", (_req, res) => res.json(readJson("data/admin/music_speech_review_center_v53.json")));
  app.get("/api/ops/vps/v53/evidence-backfill", (_req, res) => res.json(readJson("data/deployment/production_evidence_backfill_v53.json")));
  app.get("/api/admin/speech-training/v53/legal-batch", (_req, res) => res.json(readJson("data/security/legal_speech_training_batch_v53.json")));
  app.get("/api/ops/search/music/v53/ranking-upgrade", (_req, res) => res.json(readJson("data/search/music_search_ranking_upgrade_v53.json")));
  app.get("/api/ops/authority-sources/v53/publication", (_req, res) => res.json(readJson("data/integration/authority_metadata_publication_v53.json")));
  app.get("/api/ops/speech-training/v53/model-seal", (_req, res) => res.json(readJson("data/audio/speech_model_governance_seal_v53.json")));
  app.get("/api/ops/site/v53/formal-monitoring", (_req, res) => res.json(readJson("data/site/formal_monitoring_operations_v53.json")));
  app.get("/api/ops/vps/v53/preflight-contract", (_req, res) => res.json(readJson("data/ops/vps_preflight_v53.json")));
  app.get("/api/ops/next-upgrade-plan/v54", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v54.json")));
  app.get("/api/public/music/metadata/v53/cards", (_req, res) => res.json(readJson("data/integration/authority_metadata_publication_v53.json")));

  app.post("/api/internal/vps/v53/record-health-evidence", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.environment || !body.status || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_health_evidence", blocked_terms:guard.blocked });
    try { const eventId = body.check_id ?? id("health-v53", body); const tx = await writeEvent("production_evidence_backfill_checks_v53", "check_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_health_evidence_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v53/record-dns-evidence", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.domain_name || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_dns_evidence", blocked_terms:guard.blocked });
    try { const eventId = body.dns_id ?? id("dns-v53", body); const tx = await writeEvent("production_evidence_dns_records_v53", "dns_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_dns_evidence_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v53/record-backup-restore-evidence", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.backup_sha256 || !body.restore_sha256 || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_backup_restore_evidence", blocked_terms:guard.blocked });
    try { const eventId = body.drill_id ?? id("backup-restore-v53", body); const tx = await writeEvent("production_evidence_backup_restore_v53", "drill_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_backup_restore_evidence_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v53/record-observation-window", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.environment || !body.duration_minutes || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_observation_window", blocked_terms:guard.blocked });
    try { const eventId = body.window_id ?? id("observation-window-v53", body); const tx = await writeEvent("production_evidence_observation_windows_v53", "window_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_observation_window_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v53/seal-backfill-report", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.evidence_bundle_hash || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_backfill_seal", blocked_terms:guard.blocked });
    try { const eventId = body.seal_id ?? id("backfill-seal-v53", body); const tx = await writeEvent("production_backfill_seals_v53", "seal_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_backfill_seal_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v53/attach-evidence-file", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.asset_id || !body.evidence_type || !body.file_sha256 || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_evidence_file", blocked_terms:guard.blocked });
    try { const eventId = body.file_id ?? id("legal-evidence-file-v53", body); const tx = await writeEvent("legal_speech_evidence_files_v53", "file_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_evidence_file_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v53/approve-legal-asset", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.asset_id || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_legal_asset_approval", blocked_terms:guard.blocked });
    try { const eventId = body.approval_id ?? id("legal-approval-v53", body); const tx = await writeEvent("legal_speech_asset_approvals_v53", "approval_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_legal_asset_approval_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v53/export-legal-batch", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_legal_batch_export", blocked_terms:guard.blocked });
    try { const eventId = body.export_id ?? id("legal-export-v53", body); const tx = await writeEvent("legal_speech_exports_v53", "export_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_legal_batch_export_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v53/record-native-speaker-review", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.asset_id || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_native_speaker_review", blocked_terms:guard.blocked });
    try { const eventId = body.approval_id ?? id("native-review-v53", body); const tx = await writeEvent("legal_speech_asset_approvals_v53", "approval_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_native_speaker_review_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v53/record-ranking-metric", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.feature || !body.variant || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_ranking_metric", blocked_terms:guard.blocked });
    try { const eventId = body.metric_id ?? id("ranking-metric-v53", body); const tx = await writeEvent("music_search_ranking_metrics_v53", "metric_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_ranking_metric_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v53/approve-ranking-rollout", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.feature || !body.rollout_percent || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_ranking_rollout", blocked_terms:guard.blocked });
    try { const eventId = body.rollout_id ?? id("ranking-rollout-v53", body); const tx = await writeEvent("music_search_ranking_rollouts_v53", "rollout_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_ranking_rollout_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v53/rollback-ranking-rollout", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.feature || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_ranking_rollback", blocked_terms:guard.blocked });
    try { const eventId = body.rollout_id ?? id("ranking-rollback-v53", body); const tx = await writeEvent("music_search_ranking_rollouts_v53", "rollout_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_ranking_rollback_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v53/create-synonym-merge-task", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.term || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_synonym_merge_task", blocked_terms:guard.blocked });
    try { const eventId = body.task_id ?? id("synonym-task-v53", body); const tx = await writeEvent("music_search_synonym_merge_tasks_v53", "task_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_synonym_merge_task_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v53/publish-metadata-card", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.route_path || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_metadata_publication", blocked_terms:guard.blocked });
    try { const eventId = body.publication_id ?? id("metadata-card-v53", body); const tx = await writeEvent("authority_metadata_public_cards_v53", "publication_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_metadata_publication_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v53/record-source-change", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.source_id || !body.change_type || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_source_change", blocked_terms:guard.blocked });
    try { const eventId = body.change_id ?? id("source-change-v53", body); const tx = await writeEvent("authority_metadata_source_changes_v53", "change_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_source_change_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v53/test-takedown-flow", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.publication_id || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_takedown_test", blocked_terms:guard.blocked });
    try { const eventId = body.test_id ?? id("takedown-test-v53", body); const tx = await writeEvent("authority_metadata_takedown_tests_v53", "test_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_takedown_test_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v53/render-governance-pdf", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.artifact_path || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_governance_pdf", blocked_terms:guard.blocked });
    try { const eventId = body.pdf_id ?? id("governance-pdf-v53", body); const tx = await writeEvent("speech_model_governance_pdfs_v53", "pdf_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_governance_pdf_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v53/record-signoff-section", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.status || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_signoff_section", blocked_terms:guard.blocked });
    try { const eventId = body.section_id ?? id("signoff-section-v53", body); const tx = await writeEvent("speech_model_signoff_sections_v53", "section_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_signoff_section_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v53/record-lineage-dag", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_lineage_dag", blocked_terms:guard.blocked });
    try { const eventId = body.section_id ?? id("lineage-dag-v53", body); const tx = await writeEvent("speech_model_signoff_sections_v53", "section_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_lineage_dag_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v53/close-release-blocker", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.status || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_release_blocker", blocked_terms:guard.blocked });
    try { const eventId = body.blocker_id ?? id("release-blocker-v53", body); const tx = await writeEvent("speech_model_release_blockers_v53", "blocker_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_release_blocker_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v53/record-uptime-sample", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.route_path || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_uptime_sample", blocked_terms:guard.blocked });
    try { const eventId = body.sample_id ?? id("uptime-sample-v53", body); const tx = await writeEvent("site_uptime_samples_v53", "sample_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_uptime_sample_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v53/record-error-rate", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.route_path || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_error_rate", blocked_terms:guard.blocked });
    try { const eventId = body.sample_id ?? id("error-rate-v53", body); const tx = await writeEvent("site_error_rate_samples_v53", "sample_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_error_rate_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v53/record-lighthouse-run", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.route_path || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_lighthouse_run", blocked_terms:guard.blocked });
    try { const eventId = body.sample_id ?? id("lighthouse-run-v53", body); const tx = await writeEvent("site_uptime_samples_v53", "sample_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_lighthouse_run_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v53/create-ops-report", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.cadence || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_ops_report", blocked_terms:guard.blocked });
    try { const eventId = body.report_id ?? id("ops-report-v53", body); const tx = await writeEvent("site_ops_reports_v53", "report_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_ops_report_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v53/send-alert-notification", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.alert_type || !guard.ok) return res.status(400).json({ ok:false, version:"v53", error:"invalid_alert_notification", blocked_terms:guard.blocked });
    try { const eventId = body.alert_id ?? id("alert-v53", body); const tx = await writeEvent("site_alert_notifications_v53", "alert_id", eventId, body); res.json({ ok:true, accepted:true, version:"v53", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v53", error:"invalid_alert_notification_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });
}
