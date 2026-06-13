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
async function withMysqlTransaction<T>(work: (conn: any) => Promise<T>) { if (!pool) return { db_mode: "contract_only_database_url_missing" as const, committed: false as const, result: null as T | null }; const conn = await pool.getConnection(); try { await conn.beginTransaction(); const result = await work(conn); await conn.commit(); return { db_mode: "mysql_transaction" as const, committed: true as const, result }; } catch (error) { await conn.rollback(); throw error; } finally { conn.release(); } }
function id(prefix: string, body: unknown) { return `${prefix}-${sha(body).slice(0,16)}`; }
async function writeEvent(table: string, key: string, value: string, body: unknown) { return withMysqlTransaction(async (conn) => { await conn.execute(`INSERT IGNORE INTO ${table} (${key}, actor_id, status, event_json, current_hash) VALUES (?,?,?,?,?)`, [value, (body as any).actor_id ?? "system", (body as any).status ?? "recorded", JSON.stringify(body), sha(body)]); return { [key]: value }; }); }
function validate(body: any, required: string[]) { const guard = guardText(body); const missing = required.filter((key) => body?.[key] === undefined || body?.[key] === null || body?.[key] === ""); return { ok: guard.ok && missing.length === 0, blocked: guard.blocked, missing }; }

export function registerTtsSttMusicV62Routes(app: Express) {
  app.get("/api/admin/music-speech/v62/review-center", (_req, res) => res.json(readJson("data/admin/music_speech_review_center_v62.json")));
  app.get("/api/ops/vps/v62/final-ledger", (_req, res) => res.json(readJson("data/deployment/production_final_ledger_v62.json")));
  app.get("/api/admin/speech-training/v62/real-output", (_req, res) => res.json(readJson("data/security/legal_speech_dataset_real_output_v62.json")));
  app.get("/api/ops/search/music/v62/weekly-operations", (_req, res) => res.json(readJson("data/search/music_search_weekly_operations_v62.json")));
  app.get("/api/ops/authority-sources/v62/public-expansion", (_req, res) => res.json(readJson("data/integration/authority_metadata_public_expansion_v62.json")));
  app.get("/api/ops/speech-training/v62/governance-alert-live-test", (_req, res) => res.json(readJson("data/audio/speech_governance_alert_live_test_v62.json")));
  app.get("/api/ops/site/v62/delivery-seal", (_req, res) => res.json(readJson("data/site/operations_notification_delivery_seal_v62.json")));
  app.get("/api/ops/vps/v62/preflight-contract", (_req, res) => res.json(readJson("data/ops/vps_preflight_v62.json")));
  app.get("/api/ops/next-upgrade-plan/v63", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v63.json")));

  app.post("/api/internal/vps/v62/append-final-ledger-entry", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "certificate_json_sha256", "certificate_pdf_sha256", "previous_hash", "current_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.ledger_id ?? id("final-ledger-v62", body); const tx = await writeEvent("release_final_ledger_entries_v62", "ledger_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v62/record-real-dns-cloudflare-snapshot", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dns_snapshot_hash", "cloudflare_snapshot_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.snapshot_id ?? id("dns-cloudflare-v62", body); const tx = await writeEvent("release_real_dns_cloudflare_snapshots_v62", "snapshot_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v62/record-real-restore-rollback-evidence", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "restore_log_hash", "rollback_log_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.evidence_id ?? id("restore-rollback-v62", body); const tx = await writeEvent("release_real_restore_rollback_evidence_v62", "evidence_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v62/record-real-observation-window", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "uptime_window_hash", "p95_latency_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.window_id ?? id("observation-window-v62", body); const tx = await writeEvent("release_real_observation_windows_v62", "window_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v62/record-final-audit-sample", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "sample_set_hash", "auditor_notes_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.sample_id ?? id("audit-sample-v62", body); const tx = await writeEvent("release_final_audit_samples_v62", "sample_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v62/mark-release-final-status", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "final_certificate_status", "immutable_lock_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.status_id ?? id("release-status-v62", body); const tx = await writeEvent("release_certificate_final_statuses_v62", "status_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v62/create-real-output-batch", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "batch_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.batch_id ?? id("real-output-batch-v62", body); const tx = await writeEvent("legal_speech_real_output_batches_v62", "batch_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v62/export-real-train-dev-test", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "export_request_id"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.export_id ?? id("real-export-v62", body); const tx = await writeEvent("legal_speech_train_dev_test_exports_v62", "export_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v62/lock-dataset-hash", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "dataset_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.lock_id ?? id("dataset-hash-lock-v62", body); const tx = await writeEvent("legal_speech_dataset_hash_locks_v62", "lock_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v62/release-model-card", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "model_card_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.model_card_id ?? id("model-card-release-v62", body); const tx = await writeEvent("legal_speech_model_card_releases_v62", "model_card_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v62/write-blocked-report", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "blocked_report_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.report_id ?? id("blocked-report-v62", body); const tx = await writeEvent("legal_speech_blocked_reports_v62", "report_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v62/write-weekly-operations-report", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "week", "metrics_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.report_id ?? id("search-weekly-ops-v62", body); const tx = await writeEvent("search_weekly_operations_reports_v62", "report_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v62/create-sla-task", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "trigger", "sla_hours"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.task_id ?? id("search-sla-task-v62", body); const tx = await writeEvent("search_sla_tasks_v62", "task_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v62/record-rollback-drill-result", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "drill_hash", "result"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.drill_id ?? id("search-rollback-drill-v62", body); const tx = await writeEvent("search_rollback_drill_results_v62", "drill_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v62/record-quality-regression-result", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "test_hash", "passed"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.test_id ?? id("search-regression-v62", body); const tx = await writeEvent("search_quality_regression_results_v62", "test_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority/v62/record-public-expansion", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "source", "metadata_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.record_id ?? id("authority-public-expansion-v62", body); const tx = await writeEvent("authority_public_expansion_records_v62", "record_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority/v62/seal-citation-screenshot", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "record_id", "screenshot_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.evidence_id ?? id("citation-screenshot-v62", body); const tx = await writeEvent("authority_public_citation_screenshots_v62", "evidence_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority/v62/seal-sitemap-og-evidence", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "record_id", "sitemap_og_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.evidence_id ?? id("sitemap-og-v62", body); const tx = await writeEvent("authority_public_sitemap_og_evidence_v62", "evidence_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority/v62/seal-takedown-rehearsal", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "record_id", "rehearsal_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.evidence_id ?? id("takedown-rehearsal-v62", body); const tx = await writeEvent("authority_public_takedown_rehearsals_v62", "evidence_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority/v62/seal-source-drift-snapshot", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "record_id", "drift_snapshot_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.snapshot_id ?? id("source-drift-v62", body); const tx = await writeEvent("authority_public_source_drift_snapshots_v62", "snapshot_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/governance/v62/record-live-download-alert", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "artifact_id", "alert_scenario"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.alert_id ?? id("governance-live-alert-v62", body); const tx = await writeEvent("governance_download_live_alerts_v62", "alert_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/governance/v62/ack-live-download-alert", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "alert_id", "ack_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.ack_id ?? id("governance-alert-ack-v62", body); const tx = await writeEvent("governance_download_live_alert_acks_v62", "ack_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/governance/v62/close-live-download-alert", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "alert_id", "closure_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.closure_id ?? id("governance-alert-close-v62", body); const tx = await writeEvent("governance_download_live_alert_closures_v62", "closure_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/governance/v62/record-rbac-watermark-test", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "test_hash", "passed"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.test_id ?? id("governance-rbac-watermark-v62", body); const tx = await writeEvent("governance_rbac_watermark_tests_v62", "test_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/governance/v62/signoff-audit-export", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "export_hash", "signoff_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.signoff_id ?? id("governance-audit-signoff-v62", body); const tx = await writeEvent("governance_audit_export_signoffs_v62", "signoff_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/ops/v62/record-live-notification-send", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "job_id", "delivery_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.send_id ?? id("ops-live-send-v62", body); const tx = await writeEvent("operations_live_notification_sends_v62", "send_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/ops/v62/ack-live-notification", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "job_id", "ack_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.ack_id ?? id("ops-live-ack-v62", body); const tx = await writeEvent("operations_live_notification_acks_v62", "ack_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/ops/v62/escalate-live-notification", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "job_id", "reason"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.escalation_id ?? id("ops-live-escalate-v62", body); const tx = await writeEvent("operations_live_notification_escalations_v62", "escalation_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/ops/v62/close-live-notification", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "job_id", "closure_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.closure_id ?? id("ops-live-close-v62", body); const tx = await writeEvent("operations_live_notification_closures_v62", "closure_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/ops/v62/create-weekly-review-task", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "task_title", "source_report_id"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v62", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.task_id ?? id("ops-weekly-review-v62", body); const tx = await writeEvent("operations_weekly_review_tasks_v62", "task_id", eventId, body); res.json({ ok:true, accepted:true, version:"v62", ...tx, real_vps_completed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v62", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

}
