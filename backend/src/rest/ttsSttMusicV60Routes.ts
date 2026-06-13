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

export function registerTtsSttMusicV60Routes(app: Express) {
  app.get("/api/admin/music-speech/v60/review-center", (_req, res) => res.json(readJson("data/admin/music_speech_review_center_v60.json")));
  app.get("/api/ops/vps/v60/final-seal", (_req, res) => res.json(readJson("data/deployment/release_certificate_final_seal_v60.json")));
  app.get("/api/admin/speech-training/v60/immutable-freeze", (_req, res) => res.json(readJson("data/security/legal_speech_dataset_immutable_freeze_v60.json")));
  app.get("/api/ops/search/music/v60/weekly-sla", (_req, res) => res.json(readJson("data/search/music_search_weekly_sla_v60.json")));
  app.get("/api/ops/authority-sources/v60/source-expansion", (_req, res) => res.json(readJson("data/integration/authority_metadata_source_expansion_v60.json")));
  app.get("/api/ops/speech-training/v60/governance-alert-closure", (_req, res) => res.json(readJson("data/audio/speech_governance_download_alert_closure_v60.json")));
  app.get("/api/ops/site/v60/real-delivery", (_req, res) => res.json(readJson("data/site/operations_notification_real_delivery_v60.json")));
  app.get("/api/ops/vps/v60/preflight-contract", (_req, res) => res.json(readJson("data/ops/vps_preflight_v60.json")));
  app.get("/api/ops/next-upgrade-plan/v61", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v61.json")));

  app.post("/api/internal/vps/v60/record-final-seal", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "certificate_json_sha256", "certificate_pdf_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.seal_id ?? id("final-seal-v60", body); const tx = await writeEvent("release_certificate_final_seals_v60", "seal_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v60/record-restore-final-verification", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "backup_archive_sha256", "restore_log_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.verification_id ?? id("restore-final-v60", body); const tx = await writeEvent("release_restore_final_verifications_v60", "verification_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v60/record-rollback-final-verification", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "rollback_log_hash", "post_rollback_health_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.verification_id ?? id("rollback-final-v60", body); const tx = await writeEvent("release_rollback_final_verifications_v60", "verification_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v60/record-dns-cloudflare-final-verification", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dns_snapshot_hash", "cloudflare_snapshot_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.verification_id ?? id("dns-cloudflare-final-v60", body); const tx = await writeEvent("release_dns_cloudflare_final_verifications_v60", "verification_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v60/record-observation-final-verification", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "uptime_hash", "latency_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.verification_id ?? id("observation-final-v60", body); const tx = await writeEvent("release_observation_final_verifications_v60", "verification_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v60/record-hash-chain-final-verification", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "previous_hash", "current_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.verification_id ?? id("hash-chain-final-v60", body); const tx = await writeEvent("release_hash_chain_final_verifications_v60", "verification_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v60/freeze-immutable-dataset", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "freeze_request_id"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.freeze_id ?? id("immutable-freeze-v60", body); const tx = await writeEvent("legal_speech_dataset_immutable_freezes_v60", "freeze_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v60/export-final-train-dev-test", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "export_request_id"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.export_id ?? id("final-export-v60", body); const tx = await writeEvent("legal_speech_final_train_dev_test_exports_v60", "export_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v60/lock-dataset-version", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "lock_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.lock_id ?? id("dataset-lock-v60", body); const tx = await writeEvent("legal_speech_dataset_version_locks_v60", "lock_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v60/write-final-checksum-manifest", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "checksum_manifest_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.checksum_id ?? id("final-checksum-v60", body); const tx = await writeEvent("legal_speech_final_checksum_manifests_v60", "checksum_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v60/write-final-model-card", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "model_card_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.model_card_id ?? id("final-model-card-v60", body); const tx = await writeEvent("legal_speech_final_model_cards_v60", "model_card_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v60/write-weekly-quality-report", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "report_window", "metrics_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.report_id ?? id("search-weekly-quality-v60", body); const tx = await writeEvent("search_weekly_quality_reports_v60", "report_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v60/create-anomaly-sla-task", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "trigger", "sla_hours"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.task_id ?? id("search-anomaly-sla-v60", body); const tx = await writeEvent("search_anomaly_sla_tasks_v60", "task_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v60/record-policy-regression-test", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "policy_id", "test_result_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.test_id ?? id("search-regression-v60", body); const tx = await writeEvent("search_policy_regression_tests_v60", "test_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v60/record-rollback-drill", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "drill_result", "metrics_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.drill_id ?? id("search-rollback-drill-v60", body); const tx = await writeEvent("search_rollback_drills_v60", "drill_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority/v60/record-source-expansion", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "source", "metadata_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.record_id ?? id("authority-source-expansion-v60", body); const tx = await writeEvent("authority_metadata_source_expansions_v60", "record_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority/v60/seal-citation-evidence", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "record_id", "screenshot_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.evidence_id ?? id("citation-seal-v60", body); const tx = await writeEvent("authority_citation_evidence_seals_v60", "evidence_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority/v60/seal-takedown-evidence", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "record_id", "rehearsal_log_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.evidence_id ?? id("takedown-seal-v60", body); const tx = await writeEvent("authority_takedown_evidence_seals_v60", "evidence_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority/v60/seal-source-drift-evidence", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "record_id", "drift_snapshot_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.evidence_id ?? id("source-drift-seal-v60", body); const tx = await writeEvent("authority_source_drift_evidence_seals_v60", "evidence_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/governance/v60/record-download-alert", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "artifact_id", "alert_rule"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.alert_id ?? id("download-alert-v60", body); const tx = await writeEvent("governance_download_alerts_v60", "alert_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/governance/v60/ack-download-alert", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "alert_id", "ack_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.ack_id ?? id("download-alert-ack-v60", body); const tx = await writeEvent("governance_download_alert_acks_v60", "ack_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/governance/v60/close-download-alert", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "alert_id", "closure_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.closure_id ?? id("download-alert-close-v60", body); const tx = await writeEvent("governance_download_alert_closures_v60", "closure_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/governance/v60/write-weekly-audit-report", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "week", "report_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.report_id ?? id("governance-weekly-audit-v60", body); const tx = await writeEvent("governance_weekly_audit_reports_v60", "report_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/governance/v60/write-rbac-download-test", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "test_hash", "passed"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.test_id ?? id("governance-rbac-test-v60", body); const tx = await writeEvent("governance_rbac_download_tests_v60", "test_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/ops/v60/record-notification-delivery", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "job_id", "delivery_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.delivery_id ?? id("ops-delivery-v60", body); const tx = await writeEvent("operations_notification_deliveries_v60", "delivery_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/ops/v60/ack-notification", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "job_id", "ack_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.ack_id ?? id("ops-ack-v60", body); const tx = await writeEvent("operations_notification_acks_v60", "ack_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/ops/v60/escalate-notification", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "job_id", "escalation_reason"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.escalation_id ?? id("ops-escalate-v60", body); const tx = await writeEvent("operations_notification_escalations_v60", "escalation_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/ops/v60/close-notification", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "job_id", "closure_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.closure_id ?? id("ops-close-v60", body); const tx = await writeEvent("operations_notification_closures_v60", "closure_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/ops/v60/create-weekly-improvement-task", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "task_title", "source_alert_id"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v60", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.task_id ?? id("ops-improvement-v60", body); const tx = await writeEvent("operations_weekly_improvement_tasks_v60", "task_id", eventId, body); res.json({ ok:true, accepted:true, version:"v60", ...tx, production_final_sealed:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v60", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

}
