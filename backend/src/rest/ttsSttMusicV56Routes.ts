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
  "release_certificate_immutable_artifacts_v56": "artifact_json",
  "release_certificate_backup_evidence_v56": "evidence_json",
  "release_certificate_rollback_observations_v56": "observation_json",
  "release_certificate_immutable_ledger_v56": "ledger_json",
  "legal_speech_dataset_manifests_v56": "manifest_json",
  "legal_speech_export_artifacts_v56": "export_json",
  "legal_speech_blocked_reports_v56": "report_json",
  "legal_speech_model_cards_v56": "model_card_json",
  "music_search_post_rollout_24h_metrics_v56": "metric_json",
  "music_search_post_rollout_72h_metrics_v56": "metric_json",
  "music_search_post_rollout_incident_rollbacks_v56": "rollback_json",
  "authority_metadata_publication_records_v56": "record_json",
  "authority_metadata_sitemap_og_ping_v56": "ping_json",
  "authority_metadata_takedown_evidence_v56": "evidence_json",
  "speech_model_governance_downloadable_artifacts_v56": "artifact_json",
  "speech_model_governance_audit_queries_v56": "query_json",
  "speech_model_governance_signoff_verifications_v56": "verification_json",
  "site_ops_recurring_daily_jobs_v56": "job_json",
  "site_ops_recurring_weekly_jobs_v56": "job_json",
  "site_ops_alert_dispatches_v56": "dispatch_json",
  "site_ops_cwv_lighthouse_samples_v56": "sample_json"
};
async function writeEvent(table: string, key: string, value: string, body: unknown) {
  return withMysqlTransaction(async (conn) => {
    const jsonCol = jsonColumns[table] ?? "event_json";
    await conn.execute(`INSERT IGNORE INTO ${table} (${key}, actor_id, status, ${jsonCol}) VALUES (?,?,?,CAST(? AS JSON))`, [value, (body as any).actor_id ?? "system", (body as any).status ?? "recorded", JSON.stringify(body)]);
    return { [key]: value };
  });
}
function validate(body: any, required: string[]) { const guard = guardText(body); const missing = required.filter((key) => body?.[key] === undefined || body?.[key] === null || body?.[key] === ""); return { ok: guard.ok && missing.length === 0, blocked: guard.blocked, missing }; }

export function registerTtsSttMusicV56Routes(app: Express) {
  app.get("/api/admin/music-speech/v56/review-center", (_req, res) => res.json(readJson("data/admin/music_speech_review_center_v56.json")));
  app.get("/api/ops/vps/v56/immutable-release-evidence", (_req, res) => res.json(readJson("data/deployment/release_certificate_immutable_evidence_v56.json")));
  app.get("/api/admin/speech-training/v56/legal-real-export", (_req, res) => res.json(readJson("data/security/legal_speech_real_export_v56.json")));
  app.get("/api/ops/search/music/v56/post-rollout-monitoring", (_req, res) => res.json(readJson("data/search/music_search_post_rollout_monitoring_v56.json")));
  app.get("/api/public/music/metadata/v56/public-records", (_req, res) => res.json(readJson("data/integration/authority_metadata_public_records_v56.json")));
  app.get("/api/ops/authority-sources/v56/public-records", (_req, res) => res.json(readJson("data/integration/authority_metadata_public_records_v56.json")));
  app.get("/api/ops/speech-training/v56/governance-download-audit", (_req, res) => res.json(readJson("data/audio/speech_model_governance_download_audit_v56.json")));
  app.get("/api/ops/site/v56/operations-cadence", (_req, res) => res.json(readJson("data/site/operations_cadence_v56.json")));
  app.get("/api/ops/vps/v56/preflight-contract", (_req, res) => res.json(readJson("data/ops/vps_preflight_v56.json")));
  app.get("/api/ops/next-upgrade-plan/v57", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v57.json")));

  app.post("/api/internal/vps/v56/store-release-pdf-json", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "artifact_sha256", "artifact_type"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.artifact_id ?? id("release-pdf-json-v56", body); const tx = await writeEvent("release_certificate_immutable_artifacts_v56", "artifact_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v56/store-cloudflare-dns-evidence", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dns_record_hash", "cutover_timestamp"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.artifact_id ?? id("cloudflare-dns-evidence-v56", body); const tx = await writeEvent("release_certificate_immutable_artifacts_v56", "artifact_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v56/store-backup-restore-evidence", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "backup_sha256", "restore_log_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.evidence_id ?? id("backup-restore-evidence-v56", body); const tx = await writeEvent("release_certificate_backup_evidence_v56", "evidence_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v56/store-rollback-observation", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "rollback_id", "health_status"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.observation_id ?? id("rollback-observation-v56", body); const tx = await writeEvent("release_certificate_rollback_observations_v56", "observation_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v56/seal-immutable-ledger", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "previous_hash", "current_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.ledger_id ?? id("immutable-ledger-v56", body); const tx = await writeEvent("release_certificate_immutable_ledger_v56", "ledger_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v56/create-dataset-manifest", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "manifest_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.manifest_id ?? id("dataset-manifest-v56", body); const tx = await writeEvent("legal_speech_dataset_manifests_v56", "manifest_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v56/export-train-dev-test", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "split_counts"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.export_id ?? id("train-dev-test-export-v56", body); const tx = await writeEvent("legal_speech_export_artifacts_v56", "export_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v56/create-blocked-report", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "blocked_count"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.report_id ?? id("blocked-report-v56", body); const tx = await writeEvent("legal_speech_blocked_reports_v56", "report_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v56/generate-model-card", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "model_card_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.model_card_id ?? id("model-card-v56", body); const tx = await writeEvent("legal_speech_model_cards_v56", "model_card_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v56/record-24h-metric", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "metric_name", "metric_value"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.metric_id ?? id("search-24h-metric-v56", body); const tx = await writeEvent("music_search_post_rollout_24h_metrics_v56", "metric_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v56/record-72h-metric", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "metric_name", "metric_value"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.metric_id ?? id("search-72h-metric-v56", body); const tx = await writeEvent("music_search_post_rollout_72h_metrics_v56", "metric_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v56/trigger-post-rollout-rollback", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "reason", "severity"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.rollback_id ?? id("post-rollout-rollback-v56", body); const tx = await writeEvent("music_search_post_rollout_incident_rollbacks_v56", "rollback_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v56/store-publication-record", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "card_id", "citation_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.record_id ?? id("publication-record-v56", body); const tx = await writeEvent("authority_metadata_publication_records_v56", "record_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v56/store-sitemap-og-ping", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "card_id", "ping_status"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.ping_id ?? id("sitemap-og-ping-v56", body); const tx = await writeEvent("authority_metadata_sitemap_og_ping_v56", "ping_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v56/store-takedown-evidence", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "card_id", "evidence_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.evidence_id ?? id("takedown-evidence-v56", body); const tx = await writeEvent("authority_metadata_takedown_evidence_v56", "evidence_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v56/register-downloadable-artifact", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "artifact_type", "artifact_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.artifact_id ?? id("downloadable-artifact-v56", body); const tx = await writeEvent("speech_model_governance_downloadable_artifacts_v56", "artifact_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v56/record-audit-query", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "artifact_id", "purpose"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.query_id ?? id("audit-query-v56", body); const tx = await writeEvent("speech_model_governance_audit_queries_v56", "query_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v56/verify-governance-signoff", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "signoff_id", "decision"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.verification_id ?? id("governance-signoff-v56", body); const tx = await writeEvent("speech_model_governance_signoff_verifications_v56", "verification_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v56/create-recurring-daily-job", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "job_name", "schedule"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.job_id ?? id("recurring-daily-job-v56", body); const tx = await writeEvent("site_ops_recurring_daily_jobs_v56", "job_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v56/create-recurring-weekly-job", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "job_name", "schedule"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.job_id ?? id("recurring-weekly-job-v56", body); const tx = await writeEvent("site_ops_recurring_weekly_jobs_v56", "job_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v56/record-alert-dispatch", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "alert_type", "channel"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.dispatch_id ?? id("alert-dispatch-v56", body); const tx = await writeEvent("site_ops_alert_dispatches_v56", "dispatch_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v56/record-cwv-lighthouse-sample", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "route_path", "status"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v56", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.sample_id ?? id("cwv-lighthouse-sample-v56", body); const tx = await writeEvent("site_ops_cwv_lighthouse_samples_v56", "sample_id", eventId, body); res.json({ ok:true, accepted:true, version:"v56", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v56", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

}
