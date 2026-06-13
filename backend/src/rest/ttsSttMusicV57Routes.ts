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
const jsonColumns: Record<string,string> = {
  "release_evidence_ledger_entries_v57": "entry_json",
  "release_evidence_certificate_seals_v57": "seal_json",
  "release_evidence_backup_restore_records_v57": "record_json",
  "release_evidence_observation_samples_v57": "sample_json",
  "legal_speech_dataset_exports_v57": "export_json",
  "legal_speech_checksum_manifests_v57": "manifest_json",
  "legal_speech_blocked_reports_v57": "report_json",
  "legal_speech_model_cards_v57": "model_card_json",
  "music_search_monitoring_decisions_v57": "decision_json",
  "music_search_anomaly_tasks_v57": "task_json",
  "music_search_rollback_decisions_v57": "rollback_json",
  "authority_metadata_public_evidence_v57": "evidence_json",
  "authority_metadata_citation_screenshots_v57": "screenshot_json",
  "authority_metadata_takedown_rehearsals_v57": "rehearsal_json",
  "speech_governance_artifact_downloads_v57": "download_json",
  "speech_governance_audit_exports_v57": "export_json",
  "speech_governance_permission_checks_v57": "check_json",
  "site_ops_report_deliveries_v57": "delivery_json",
  "site_ops_notification_channels_v57": "channel_json",
  "site_ops_alert_acknowledgements_v57": "ack_json",
  "site_ops_weekly_summaries_v57": "summary_json"
};
async function writeEvent(table: string, key: string, value: string, body: unknown) {
  return withMysqlTransaction(async (conn) => {
    const jsonCol = jsonColumns[table] ?? "event_json";
    await conn.execute(`INSERT IGNORE INTO ${table} (${key}, actor_id, status, ${jsonCol}, current_hash) VALUES (?,?,?,?,?)`, [value, (body as any).actor_id ?? "system", (body as any).status ?? "recorded", JSON.stringify(body), sha(body)]);
    return { [key]: value };
  });
}
function validate(body: any, required: string[]) { const guard = guardText(body); const missing = required.filter((key) => body?.[key] === undefined || body?.[key] === null || body?.[key] === ""); return { ok: guard.ok && missing.length === 0, blocked: guard.blocked, missing }; }

export function registerTtsSttMusicV57Routes(app: Express) {
  app.get("/api/admin/music-speech/v57/review-center", (_req, res) => res.json(readJson("data/admin/music_speech_review_center_v57.json")));
  app.get("/api/ops/vps/v57/release-evidence-ledger-seal", (_req, res) => res.json(readJson("data/deployment/release_evidence_ledger_seal_v57.json")));
  app.get("/api/admin/speech-training/v57/legal-train-dev-test", (_req, res) => res.json(readJson("data/security/legal_speech_train_dev_test_v57.json")));
  app.get("/api/ops/search/music/v57/2472-decision", (_req, res) => res.json(readJson("data/search/music_search_2472_decision_v57.json")));
  app.get("/api/public/music/metadata/v57/evidence-archive", (_req, res) => res.json(readJson("data/integration/authority_metadata_evidence_archive_v57.json")));
  app.get("/api/ops/authority-sources/v57/evidence-archive", (_req, res) => res.json(readJson("data/integration/authority_metadata_evidence_archive_v57.json")));
  app.get("/api/ops/speech-training/v57/governance-audit-query", (_req, res) => res.json(readJson("data/audio/speech_model_governance_audit_query_v57.json")));
  app.get("/api/ops/site/v57/report-notifications", (_req, res) => res.json(readJson("data/site/operations_report_notifications_v57.json")));
  app.get("/api/ops/vps/v57/preflight-contract", (_req, res) => res.json(readJson("data/ops/vps_preflight_v57.json")));
  app.get("/api/ops/next-upgrade-plan/v58", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v58.json")));

  app.post("/api/internal/vps/v57/ingest-release-evidence", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "evidence_type", "evidence_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.entry_id ?? id("release-evidence-v57", body); const tx = await writeEvent("release_evidence_ledger_entries_v57", "entry_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v57/seal-release-certificate", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "previous_hash", "current_hash", "signature"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.seal_id ?? id("release-certificate-seal-v57", body); const tx = await writeEvent("release_evidence_certificate_seals_v57", "seal_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v57/record-backup-restore-result", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "backup_sha256", "restore_status"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.record_id ?? id("backup-restore-result-v57", body); const tx = await writeEvent("release_evidence_backup_restore_records_v57", "record_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v57/record-30m-observation", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "sample_window", "health_status"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.sample_id ?? id("observation-sample-v57", body); const tx = await writeEvent("release_evidence_observation_samples_v57", "sample_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v57/export-train-dev-test", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "export_request_id"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.export_id ?? id("train-dev-test-export-v57", body); const tx = await writeEvent("legal_speech_dataset_exports_v57", "export_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v57/write-checksum-manifest", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "manifest_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.manifest_id ?? id("checksum-manifest-v57", body); const tx = await writeEvent("legal_speech_checksum_manifests_v57", "manifest_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v57/write-blocked-report", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "blocked_count"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.report_id ?? id("blocked-report-v57", body); const tx = await writeEvent("legal_speech_blocked_reports_v57", "report_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v57/write-model-card", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "model_card_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.model_card_id ?? id("model-card-v57", body); const tx = await writeEvent("legal_speech_model_cards_v57", "model_card_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v57/record-24h-decision", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "feature_key", "decision_state"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.decision_id ?? id("search-24h-decision-v57", body); const tx = await writeEvent("music_search_monitoring_decisions_v57", "decision_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v57/record-72h-decision", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "feature_key", "decision_state"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.decision_id ?? id("search-72h-decision-v57", body); const tx = await writeEvent("music_search_monitoring_decisions_v57", "decision_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v57/create-anomaly-task", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "term", "reason"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.task_id ?? id("search-anomaly-task-v57", body); const tx = await writeEvent("music_search_anomaly_tasks_v57", "task_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v57/execute-rollout-rollback", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "feature_key", "rollback_reason"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.rollback_id ?? id("search-rollback-v57", body); const tx = await writeEvent("music_search_rollback_decisions_v57", "rollback_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v57/archive-publication-evidence", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "publication_id", "evidence_type"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.evidence_id ?? id("authority-publication-evidence-v57", body); const tx = await writeEvent("authority_metadata_public_evidence_v57", "evidence_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v57/store-citation-screenshot", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "publication_id", "screenshot_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.screenshot_id ?? id("citation-screenshot-v57", body); const tx = await writeEvent("authority_metadata_citation_screenshots_v57", "screenshot_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v57/store-source-drift-sample", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "source_name", "sample_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.evidence_id ?? id("source-drift-sample-v57", body); const tx = await writeEvent("authority_metadata_public_evidence_v57", "evidence_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v57/store-takedown-rehearsal", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "publication_id", "rehearsal_status"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.rehearsal_id ?? id("takedown-rehearsal-v57", body); const tx = await writeEvent("authority_metadata_takedown_rehearsals_v57", "rehearsal_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v57/download-governance-artifact", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "artifact_id", "reason"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.download_id ?? id("governance-download-v57", body); const tx = await writeEvent("speech_governance_artifact_downloads_v57", "download_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v57/export-audit-log", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "export_scope", "reason"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.export_id ?? id("governance-audit-export-v57", body); const tx = await writeEvent("speech_governance_audit_exports_v57", "export_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v57/check-download-permission", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "artifact_id", "requested_role"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.check_id ?? id("governance-permission-check-v57", body); const tx = await writeEvent("speech_governance_permission_checks_v57", "check_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v57/send-daily-report", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "channel", "report_date"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.delivery_id ?? id("daily-report-v57", body); const tx = await writeEvent("site_ops_report_deliveries_v57", "delivery_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v57/send-weekly-report", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "channel", "week_start"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.summary_id ?? id("weekly-report-v57", body); const tx = await writeEvent("site_ops_weekly_summaries_v57", "summary_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v57/register-notification-channel", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "channel", "target_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.channel_id ?? id("notification-channel-v57", body); const tx = await writeEvent("site_ops_notification_channels_v57", "channel_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v57/acknowledge-alert", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "alert_id", "ack_status"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v57", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.ack_id ?? id("alert-ack-v57", body); const tx = await writeEvent("site_ops_alert_acknowledgements_v57", "ack_id", eventId, body); res.json({ ok:true, accepted:true, version:"v57", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v57", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });
}
