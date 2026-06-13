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
async function writeEvent(table: string, key: string, value: string, body: unknown) {
  return withMysqlTransaction(async (conn) => {
    await conn.execute(`INSERT IGNORE INTO ${table} (${key}, actor_id, status, event_json, current_hash) VALUES (?,?,?,?,?)`, [value, (body as any).actor_id ?? "system", (body as any).status ?? "recorded", JSON.stringify(body), sha(body)]);
    return { [key]: value };
  });
}
function validate(body: any, required: string[]) { const guard = guardText(body); const missing = required.filter((key) => body?.[key] === undefined || body?.[key] === null || body?.[key] === ""); return { ok: guard.ok && missing.length === 0, blocked: guard.blocked, missing }; }

export function registerTtsSttMusicV58Routes(app: Express) {
  app.get("/api/admin/music-speech/v58/review-center", (_req, res) => res.json(readJson("data/admin/music_speech_review_center_v58.json")));
  app.get("/api/ops/vps/v58/release-certificate-sealed", (_req, res) => res.json(readJson("data/deployment/production_release_certificate_sealed_v58.json")));
  app.get("/api/admin/speech-training/v58/dataset-v58", (_req, res) => res.json(readJson("data/security/legal_speech_dataset_v58_0.json")));
  app.get("/api/ops/search/music/v58/formal-config", (_req, res) => res.json(readJson("data/search/music_search_formal_config_v58.json")));
  app.get("/api/ops/authority-sources/v58/audit-seal", (_req, res) => res.json(readJson("data/integration/authority_metadata_audit_seal_v58.json")));
  app.get("/api/ops/speech-training/v58/governance-rbac-download", (_req, res) => res.json(readJson("data/audio/speech_governance_rbac_download_v58.json")));
  app.get("/api/ops/site/v58/live-delivery", (_req, res) => res.json(readJson("data/site/operations_live_delivery_v58.json")));
  app.get("/api/ops/vps/v58/preflight-contract", (_req, res) => res.json(readJson("data/ops/vps_preflight_v58.json")));
  app.get("/api/ops/next-upgrade-plan/v59", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v59.json")));

  app.post("/api/internal/vps/v58/ingest-release-certificate", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "certificate_json_sha256", "certificate_pdf_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.seal_id ?? id("release-certificate-v58", body); const tx = await writeEvent("release_certificate_immutable_seals_v58", "seal_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v58/ingest-release-evidence", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "evidence_type", "evidence_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.entry_id ?? id("release-evidence-v58", body); const tx = await writeEvent("release_evidence_ledger_entries_v58", "entry_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v58/record-backup-restore-evidence", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "backup_sha256", "restore_log_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.record_id ?? id("backup-restore-v58", body); const tx = await writeEvent("release_backup_restore_evidence_v58", "record_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v58/record-dns-cloudflare-evidence", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dns_record_hash", "cloudflare_zone_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.evidence_id ?? id("dns-cloudflare-v58", body); const tx = await writeEvent("release_dns_cloudflare_evidence_v58", "evidence_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v58/record-30m-observation", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "sample_window", "health_status"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.observation_id ?? id("observation-v58", body); const tx = await writeEvent("release_observation_evidence_v58", "observation_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v58/verify-hash-chain", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "previous_hash", "current_hash", "signature"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.verification_id ?? id("hash-chain-v58", body); const tx = await writeEvent("release_hash_chain_verifications_v58", "verification_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v58/export-dataset", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "export_request_id"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.export_id ?? id("dataset-export-v58", body); const tx = await writeEvent("legal_speech_dataset_exports_v58", "export_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v58/write-dataset-manifest", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "manifest_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.manifest_id ?? id("dataset-manifest-v58", body); const tx = await writeEvent("legal_speech_dataset_manifests_v58", "manifest_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v58/write-checksum", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "checksum_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.checksum_id ?? id("dataset-checksum-v58", body); const tx = await writeEvent("legal_speech_dataset_checksums_v58", "checksum_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v58/write-blocked-report", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "blocked_count"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.report_id ?? id("blocked-report-v58", body); const tx = await writeEvent("legal_speech_dataset_blocked_reports_v58", "report_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v58/write-model-card", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "model_card_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.model_card_id ?? id("model-card-v58", body); const tx = await writeEvent("legal_speech_model_cards_v58", "model_card_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v58/apply-formal-config", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "feature_key", "decision_state"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.decision_id ?? id("formal-config-v58", body); const tx = await writeEvent("search_formal_config_decisions_v58", "decision_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v58/record-rollout-monitoring", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "window", "metric_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.monitoring_id ?? id("rollout-monitoring-v58", body); const tx = await writeEvent("search_100_rollout_monitoring_v58", "monitoring_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v58/create-human-task", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "term", "reason"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.task_id ?? id("search-human-task-v58", body); const tx = await writeEvent("search_anomaly_human_tasks_v58", "task_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v58/rollback-feature", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "feature_key", "rollback_reason"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.rollback_id ?? id("search-rollback-v58", body); const tx = await writeEvent("search_rollback_events_v58", "rollback_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v58/seal-audit-record", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "publication_id", "audit_seal_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.seal_id ?? id("authority-audit-v58", body); const tx = await writeEvent("authority_metadata_audit_seals_v58", "seal_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v58/store-sitemap-og-evidence", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "publication_id", "evidence_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.evidence_id ?? id("sitemap-og-v58", body); const tx = await writeEvent("authority_metadata_sitemap_og_evidence_v58", "evidence_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v58/store-citation-evidence", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "publication_id", "citation_screenshot_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.citation_id ?? id("citation-v58", body); const tx = await writeEvent("authority_metadata_citation_evidence_v58", "citation_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v58/store-takedown-evidence", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "publication_id", "rehearsal_status"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.takedown_id ?? id("takedown-v58", body); const tx = await writeEvent("authority_metadata_takedown_evidence_v58", "takedown_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/governance/v58/download-artifact", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "artifact_id", "reason"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.download_id ?? id("governance-download-v58", body); const tx = await writeEvent("governance_artifact_downloads_v58", "download_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/governance/v58/run-permission-test", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "artifact_id", "requested_role"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.test_id ?? id("permission-test-v58", body); const tx = await writeEvent("governance_permission_tests_v58", "test_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/governance/v58/export-audit", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "export_scope", "reason"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.export_id ?? id("audit-export-v58", body); const tx = await writeEvent("governance_audit_exports_v58", "export_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/governance/v58/write-watermark-event", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "artifact_id", "watermark_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.watermark_id ?? id("watermark-v58", body); const tx = await writeEvent("governance_watermark_events_v58", "watermark_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v58/send-report", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "channel", "report_date"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.delivery_id ?? id("ops-report-v58", body); const tx = await writeEvent("site_ops_report_deliveries_v58", "delivery_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v58/test-channel", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "channel", "target_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.test_id ?? id("channel-test-v58", body); const tx = await writeEvent("site_ops_channel_tests_v58", "test_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v58/escalate-alert", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "alert_id", "escalation_state"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v58", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.escalation_id ?? id("alert-escalation-v58", body); const tx = await writeEvent("site_ops_alert_escalations_v58", "escalation_id", eventId, body); res.json({ ok:true, accepted:true, version:"v58", ...tx, production_certified:false, dataset_export_allowed:false, public_audio_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v58", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });
}
