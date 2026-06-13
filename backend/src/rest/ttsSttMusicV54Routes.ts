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
  "production_release_signoffs_v54": "signoff_json",
  "production_release_evidence_v54": "evidence_json",
  "production_release_certificates_v54": "certificate_json",
  "production_release_reopen_v54": "reopen_json",
  "legal_speech_evidence_uploads_v54": "file_json",
  "legal_speech_native_reviews_v54": "review_json",
  "legal_speech_dataset_asset_approvals_v54": "approval_json",
  "legal_speech_dataset_versions_v54": "version_json",
  "legal_speech_dataset_exports_v54": "export_json",
  "music_search_rollout_metrics_v54": "metric_json",
  "music_search_rollout_50_v54": "rollout_json",
  "music_search_rollout_100_v54": "rollout_json",
  "music_search_ranking_rollbacks_v54": "rollback_json",
  "authority_site_cards_v54": "metadata_json",
  "authority_metadata_index_jobs_v54": "job_json",
  "authority_sitemap_og_pings_v54": "ping_json",
  "authority_source_drift_events_v54": "drift_json",
  "authority_takedown_executions_v54": "takedown_json",
  "speech_model_pdf_archives_v54": "pdf_json",
  "speech_model_lineage_archives_v54": "lineage_json",
  "speech_model_final_signoffs_v54": "signoff_json",
  "speech_model_governance_seals_v54": "seal_json",
  "site_uptime_cwv_samples_v54": "sample_json",
  "site_og_sitemap_checks_v54": "check_json",
  "site_daily_ops_reports_v54": "report_json",
  "site_weekly_ops_reports_v54": "report_json",
  "site_alerts_v54": "alert_json",
};
async function writeEvent(table: string, key: string, value: string, body: unknown) {
  return withMysqlTransaction(async (conn) => {
    const jsonCol = jsonColumns[table] ?? "event_json";
    await conn.execute(`INSERT IGNORE INTO ${table} (${key}, actor_id, status, ${jsonCol}) VALUES (?,?,?,CAST(? AS JSON))`, [value, (body as any).actor_id ?? "system", (body as any).status ?? "recorded", JSON.stringify(body)]);
    return { [key]: value };
  });
}
function validate(body: any, required: string[]) { const guard = guardText(body); const missing = required.filter((key) => body?.[key] === undefined || body?.[key] === null || body?.[key] === ""); return { ok: guard.ok && missing.length === 0, blocked: guard.blocked, missing }; }

export function registerTtsSttMusicV54Routes(app: Express) {
  app.get("/api/admin/music-speech/v54/review-center", (_req, res) => res.json(readJson("data/admin/music_speech_review_center_v54.json")));
  app.get("/api/ops/vps/v54/release-certificate", (_req, res) => res.json(readJson("data/deployment/production_release_certificate_v54.json")));
  app.get("/api/admin/speech-training/v54/dataset-release", (_req, res) => res.json(readJson("data/security/legal_speech_dataset_release_v54.json")));
  app.get("/api/ops/search/music/v54/ranking-rollout", (_req, res) => res.json(readJson("data/search/music_search_ranking_rollout_v54.json")));
  app.get("/api/public/music/metadata/v54/cards", (_req, res) => res.json(readJson("data/integration/authority_metadata_site_publication_v54.json")));
  app.get("/api/ops/authority-sources/v54/site-publication", (_req, res) => res.json(readJson("data/integration/authority_metadata_site_publication_v54.json")));
  app.get("/api/ops/speech-training/v54/governance-archive", (_req, res) => res.json(readJson("data/audio/speech_model_governance_archive_v54.json")));
  app.get("/api/ops/site/v54/operations-automation", (_req, res) => res.json(readJson("data/site/operations_monitoring_automation_v54.json")));
  app.get("/api/ops/vps/v54/preflight-contract", (_req, res) => res.json(readJson("data/ops/vps_preflight_v54.json")));
  app.get("/api/ops/next-upgrade-plan/v55", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v55.json")));

  app.post("/api/internal/vps/v54/record-release-signoff", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "role", "decision"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.signoff_id ?? id("release-signoff-v54", body); const tx = await writeEvent("production_release_signoffs_v54", "signoff_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v54/attach-cutover-evidence", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "evidence_type", "evidence_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.evidence_id ?? id("cutover-evidence-v54", body); const tx = await writeEvent("production_release_evidence_v54", "evidence_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v54/approve-production-certificate", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "certificate_id", "evidence_bundle_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.certificate_id ?? id("production-certificate-v54", body); const tx = await writeEvent("production_release_certificates_v54", "certificate_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/vps/v54/reopen-release-certificate", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "certificate_id", "reason"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.reopen_id ?? id("reopen-certificate-v54", body); const tx = await writeEvent("production_release_reopen_v54", "reopen_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v54/upload-legal-evidence", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "asset_id", "evidence_type", "file_sha256"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.upload_id ?? id("legal-evidence-upload-v54", body); const tx = await writeEvent("legal_speech_evidence_uploads_v54", "upload_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v54/record-native-review", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "asset_id", "review_decision"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.review_id ?? id("native-review-v54", body); const tx = await writeEvent("legal_speech_native_reviews_v54", "review_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v54/approve-dataset-asset", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "asset_id", "approval_decision"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.approval_id ?? id("dataset-asset-approval-v54", body); const tx = await writeEvent("legal_speech_dataset_asset_approvals_v54", "approval_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v54/build-dataset-version", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.dataset_version_id ?? id("dataset-version-v54", body); const tx = await writeEvent("legal_speech_dataset_versions_v54", "dataset_version_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v54/export-train-dev-test", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "dataset_version", "split_counts"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.export_id ?? id("dataset-export-v54", body); const tx = await writeEvent("legal_speech_dataset_exports_v54", "export_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v54/record-rollout-metric", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "feature_key", "metric_name"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.metric_id ?? id("rollout-metric-v54", body); const tx = await writeEvent("music_search_rollout_metrics_v54", "metric_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v54/promote-rollout-50", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "feature_key", "evidence_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.rollout_id ?? id("rollout-50-v54", body); const tx = await writeEvent("music_search_rollout_50_v54", "rollout_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v54/promote-rollout-100", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "feature_key", "evidence_hash"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.rollout_id ?? id("rollout-100-v54", body); const tx = await writeEvent("music_search_rollout_100_v54", "rollout_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v54/rollback-ranking-feature", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "feature_key", "reason"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.rollback_id ?? id("ranking-rollback-v54", body); const tx = await writeEvent("music_search_ranking_rollbacks_v54", "rollback_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v54/publish-site-card", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "card_id", "rights_decision"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.card_id ?? id("authority-site-card-v54", body); const tx = await writeEvent("authority_site_cards_v54", "card_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v54/index-metadata-card", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "card_id", "index_target"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.job_id ?? id("metadata-index-v54", body); const tx = await writeEvent("authority_metadata_index_jobs_v54", "job_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v54/ping-sitemap-og", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "card_id", "ping_target"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.ping_id ?? id("sitemap-og-ping-v54", body); const tx = await writeEvent("authority_sitemap_og_pings_v54", "ping_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v54/record-source-drift", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "card_id", "drift_type"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.drift_id ?? id("source-drift-v54", body); const tx = await writeEvent("authority_source_drift_events_v54", "drift_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v54/execute-takedown", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "card_id", "reason"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.takedown_id ?? id("takedown-v54", body); const tx = await writeEvent("authority_takedown_executions_v54", "takedown_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v54/archive-governance-pdf", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "pdf_sha256", "dataset_version"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.pdf_id ?? id("governance-pdf-v54", body); const tx = await writeEvent("speech_model_pdf_archives_v54", "pdf_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v54/archive-lineage-dag", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "lineage_sha256", "dataset_version"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.lineage_id ?? id("lineage-dag-v54", body); const tx = await writeEvent("speech_model_lineage_archives_v54", "lineage_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v54/record-final-signoff", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "role", "decision"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.signoff_id ?? id("model-final-signoff-v54", body); const tx = await writeEvent("speech_model_final_signoffs_v54", "signoff_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v54/seal-model-governance", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "archive_hash", "decision"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.seal_id ?? id("model-governance-seal-v54", body); const tx = await writeEvent("speech_model_governance_seals_v54", "seal_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v54/record-uptime-cwv", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "route_path", "status"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.sample_id ?? id("uptime-cwv-v54", body); const tx = await writeEvent("site_uptime_cwv_samples_v54", "sample_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v54/record-og-sitemap-check", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "route_path", "check_type"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.check_id ?? id("og-sitemap-v54", body); const tx = await writeEvent("site_og_sitemap_checks_v54", "check_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v54/create-daily-ops-report", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "report_date", "status"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.report_id ?? id("daily-ops-v54", body); const tx = await writeEvent("site_daily_ops_reports_v54", "report_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v54/create-weekly-ops-report", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "week_id", "status"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.report_id ?? id("weekly-ops-v54", body); const tx = await writeEvent("site_weekly_ops_reports_v54", "report_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v54/send-alert", async (req, res) => {
    const body = req.body ?? {}; const check = validate(body, ["actor_id", "alert_type", "severity"]);
    if (!check.ok) return res.status(400).json({ ok:false, version:"v54", error:"invalid_request", missing:check.missing, blocked_terms:check.blocked });
    try { const eventId = body.alert_id ?? id("site-alert-v54", body); const tx = await writeEvent("site_alerts_v54", "alert_id", eventId, body); res.json({ ok:true, accepted:true, version:"v54", ...tx, release_allowed:false, public_release_allowed:false, export_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v54", error:"transaction_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

}
