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
  "production_release_signed_certificates_v55": "certificate_json",
  "production_release_signed_evidence_v55": "evidence_json",
  "production_release_signed_pdf_artifacts_v55": "pdf_json",
  "production_release_signed_reopen_v55": "reopen_json",
  "legal_speech_real_evidence_files_v55": "file_json",
  "legal_speech_hash_chain_seals_v55": "seal_json",
  "legal_speech_unblock_decisions_v55": "decision_json",
  "legal_speech_dataset_split_exports_v55": "export_json",
  "music_search_rollout_100_decisions_v55": "decision_json",
  "music_search_rollout_100_metrics_v55": "metric_json",
  "music_search_rollout_100_rollbacks_v55": "rollback_json",
  "authority_metadata_public_cards_v55": "metadata_json",
  "authority_metadata_takedown_rehearsals_v55": "rehearsal_json",
  "authority_metadata_source_drift_v55": "drift_json",
  "speech_model_governance_center_artifacts_v55": "artifact_json",
  "speech_model_governance_audit_downloads_v55": "download_json",
  "speech_model_governance_blocker_closure_v55": "closure_json",
  "site_ops_daily_reports_v55": "report_json",
  "site_ops_weekly_reports_v55": "report_json",
  "site_ops_alert_routes_v55": "alert_json",
  "site_ops_live_monitor_samples_v55": "sample_json"
};
async function writeEvent(table: string, key: string, value: string, body: unknown) {
  return withMysqlTransaction(async (conn) => {
    const jsonCol = jsonColumns[table] ?? "event_json";
    await conn.execute(`INSERT IGNORE INTO ${table} (${key}, actor_id, status, ${jsonCol}) VALUES (?,?,?,CAST(? AS JSON))`, [value, (body as any).actor_id ?? "system", (body as any).status ?? "recorded", JSON.stringify(body)]);
    return { [key]: value };
  });
}
function validate(body: any, required: string[]) { const guard = guardText(body); const missing = required.filter((key) => body?.[key] === undefined || body?.[key] === null || body?.[key] === ""); return { ok: guard.ok && missing.length === 0, blocked: guard.blocked, missing }; }

export function registerTtsSttMusicV55Routes(app: Express) {
  app.get("/api/admin/music-speech/v55/review-center", (_req, res) => res.json(readJson("data/admin/music_speech_review_center_v55.json")));
  app.get("/api/ops/vps/v55/signed-release-certificate", (_req, res) => res.json(readJson("data/deployment/production_release_certificate_signed_v55.json")));
  app.get("/api/admin/speech-training/v55/legal-unblocked-dataset", (_req, res) => res.json(readJson("data/security/legal_speech_unblocked_dataset_v55.json")));
  app.get("/api/ops/search/music/v55/rollout-100", (_req, res) => res.json(readJson("data/search/music_search_100_rollout_v55.json")));
  app.get("/api/public/music/metadata/v55/publication-cards", (_req, res) => res.json(readJson("data/integration/authority_metadata_publish_takedown_v55.json")));
  app.get("/api/ops/authority-sources/v55/publish-takedown", (_req, res) => res.json(readJson("data/integration/authority_metadata_publish_takedown_v55.json")));
  app.get("/api/ops/speech-training/v55/governance-center", (_req, res) => res.json(readJson("data/audio/speech_model_governance_archive_center_v55.json")));
  app.get("/api/ops/site/v55/operations-sop", (_req, res) => res.json(readJson("data/site/operations_monitoring_sop_v55.json")));
  app.get("/api/ops/vps/v55/preflight-contract", (_req, res) => res.json(readJson("data/ops/vps_preflight_v55.json")));
  app.get("/api/ops/next-upgrade-plan/v56", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v56.json")));

  app.post("/api/internal/vps/v55/sign-release-certificate", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "role", "decision", "evidence_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v55", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.certificate_id ?? id("release-certificate-signed-v55", body); const tx = await writeEvent("production_release_signed_certificates_v55", "certificate_id", eventId, body); res.json({ ok:true, accepted:true, version:"v55", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v55", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v55/attach-signed-evidence", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "evidence_type", "evidence_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v55", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.evidence_id ?? id("signed-evidence-v55", body); const tx = await writeEvent("production_release_signed_evidence_v55", "evidence_id", eventId, body); res.json({ ok:true, accepted:true, version:"v55", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v55", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v55/archive-certificate-pdf", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "pdf_sha256", "certificate_id"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v55", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.pdf_id ?? id("certificate-pdf-v55", body); const tx = await writeEvent("production_release_signed_pdf_artifacts_v55", "pdf_id", eventId, body); res.json({ ok:true, accepted:true, version:"v55", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v55", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v55/reopen-signed-certificate", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "certificate_id", "reason"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v55", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.reopen_id ?? id("signed-certificate-reopen-v55", body); const tx = await writeEvent("production_release_signed_reopen_v55", "reopen_id", eventId, body); res.json({ ok:true, accepted:true, version:"v55", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v55", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v55/upload-real-evidence-file", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "asset_id", "evidence_type", "file_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v55", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.file_id ?? id("real-evidence-file-v55", body); const tx = await writeEvent("legal_speech_real_evidence_files_v55", "file_id", eventId, body); res.json({ ok:true, accepted:true, version:"v55", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v55", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v55/seal-asset-hash-chain", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "asset_id", "chain_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v55", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.seal_id ?? id("hash-chain-seal-v55", body); const tx = await writeEvent("legal_speech_hash_chain_seals_v55", "seal_id", eventId, body); res.json({ ok:true, accepted:true, version:"v55", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v55", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v55/unblock-legal-asset", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "asset_id", "decision"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v55", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.decision_id ?? id("legal-unblock-decision-v55", body); const tx = await writeEvent("legal_speech_unblock_decisions_v55", "decision_id", eventId, body); res.json({ ok:true, accepted:true, version:"v55", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v55", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v55/export-legal-train-dev-test", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "split_counts"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v55", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.export_id ?? id("legal-split-export-v55", body); const tx = await writeEvent("legal_speech_dataset_split_exports_v55", "export_id", eventId, body); res.json({ ok:true, accepted:true, version:"v55", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v55", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v55/decide-rollout-100", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "feature_key", "decision"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v55", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.decision_id ?? id("rollout-100-decision-v55", body); const tx = await writeEvent("music_search_rollout_100_decisions_v55", "decision_id", eventId, body); res.json({ ok:true, accepted:true, version:"v55", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v55", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v55/record-rollout-100-metric", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "feature_key", "metric_name"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v55", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.metric_id ?? id("rollout-100-metric-v55", body); const tx = await writeEvent("music_search_rollout_100_metrics_v55", "metric_id", eventId, body); res.json({ ok:true, accepted:true, version:"v55", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v55", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v55/rollback-rollout-100", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "feature_key", "reason"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v55", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.rollback_id ?? id("rollout-100-rollback-v55", body); const tx = await writeEvent("music_search_rollout_100_rollbacks_v55", "rollback_id", eventId, body); res.json({ ok:true, accepted:true, version:"v55", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v55", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v55/publish-metadata-card", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "card_id", "rights_decision"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v55", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.card_id ?? id("metadata-card-v55", body); const tx = await writeEvent("authority_metadata_public_cards_v55", "card_id", eventId, body); res.json({ ok:true, accepted:true, version:"v55", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v55", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v55/run-takedown-rehearsal", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "card_id", "reason"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v55", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.rehearsal_id ?? id("takedown-rehearsal-v55", body); const tx = await writeEvent("authority_metadata_takedown_rehearsals_v55", "rehearsal_id", eventId, body); res.json({ ok:true, accepted:true, version:"v55", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v55", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v55/record-source-drift", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "card_id", "drift_type"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v55", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.drift_id ?? id("source-drift-v55", body); const tx = await writeEvent("authority_metadata_source_drift_v55", "drift_id", eventId, body); res.json({ ok:true, accepted:true, version:"v55", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v55", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v55/archive-governance-artifact", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "artifact_type", "artifact_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v55", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.artifact_id ?? id("governance-artifact-v55", body); const tx = await writeEvent("speech_model_governance_center_artifacts_v55", "artifact_id", eventId, body); res.json({ ok:true, accepted:true, version:"v55", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v55", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v55/record-governance-download", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "artifact_id", "purpose"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v55", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.download_id ?? id("governance-download-v55", body); const tx = await writeEvent("speech_model_governance_audit_downloads_v55", "download_id", eventId, body); res.json({ ok:true, accepted:true, version:"v55", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v55", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v55/close-model-blocker", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "blocker_id", "decision"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v55", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.closure_id ?? id("model-blocker-closure-v55", body); const tx = await writeEvent("speech_model_governance_blocker_closure_v55", "closure_id", eventId, body); res.json({ ok:true, accepted:true, version:"v55", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v55", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v55/create-daily-sop-report", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "report_date", "status"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v55", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.report_id ?? id("daily-sop-report-v55", body); const tx = await writeEvent("site_ops_daily_reports_v55", "report_id", eventId, body); res.json({ ok:true, accepted:true, version:"v55", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v55", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v55/create-weekly-sop-report", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "week_id", "status"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v55", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.report_id ?? id("weekly-sop-report-v55", body); const tx = await writeEvent("site_ops_weekly_reports_v55", "report_id", eventId, body); res.json({ ok:true, accepted:true, version:"v55", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v55", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v55/configure-alert-route", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "alert_type", "channel"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v55", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.alert_id ?? id("alert-route-v55", body); const tx = await writeEvent("site_ops_alert_routes_v55", "alert_id", eventId, body); res.json({ ok:true, accepted:true, version:"v55", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v55", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v55/record-live-monitor-sample", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "route_path", "status"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v55", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.sample_id ?? id("live-monitor-sample-v55", body); const tx = await writeEvent("site_ops_live_monitor_samples_v55", "sample_id", eventId, body); res.json({ ok:true, accepted:true, version:"v55", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v55", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

}
