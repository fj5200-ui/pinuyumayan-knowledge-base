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

export function registerTtsSttMusicV51Routes(app: Express) {
  app.get("/api/admin/music-speech/v51/review-center", (_req, res) => res.json(readJson("data/admin/music_speech_review_center_v51.json")));
  app.get("/api/ops/vps/v51/cutover-seal", (_req, res) => res.json(readJson("data/deployment/production_cutover_seal_v51.json")));
  app.get("/api/admin/speech-training/v51/evidence-upload", (_req, res) => res.json(readJson("data/security/audit_evidence_upload_v51.json")));
  app.get("/api/ops/search/music/v51/ab-experiment", (_req, res) => res.json(readJson("data/search/music_search_ab_experiment_v51.json")));
  app.get("/api/ops/authority-sources/v51/live-publication", (_req, res) => res.json(readJson("data/integration/authority_metadata_live_publish_v51.json")));
  app.get("/api/ops/speech-training/v51/governance-renderer", (_req, res) => res.json(readJson("data/audio/speech_model_governance_renderer_v51.json")));
  app.get("/api/ops/site/v51/brand-performance", (_req, res) => res.json(readJson("data/site/brand_performance_validation_v51.json")));

  app.post("/api/internal/vps/v51/record-cutover-seal", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.seal_id || !body.environment || !body.status || !body.evidence_hash || !body.idempotency_key || !guard.ok) return res.status(400).json({ ok:false, version:"v51", error:"invalid_cutover_seal", blocked_terms:guard.blocked });
    try { const tx = await withMysqlTransaction(async (conn) => { await conn.execute("INSERT INTO production_cutover_seal_reports_v51 (seal_id, actor_id, environment, status, evidence_hash, idempotency_key, release_allowed, seal_json) VALUES (?,?,?,?,?,?,FALSE,CAST(? AS JSON)) ON DUPLICATE KEY UPDATE status=VALUES(status), evidence_hash=VALUES(evidence_hash), seal_json=VALUES(seal_json)", [body.seal_id, body.actor_id, body.environment, body.status, body.evidence_hash, body.idempotency_key, JSON.stringify(body)]); return { seal_id: body.seal_id }; }); res.json({ ok:true, accepted:true, version:"v51", ...tx, release_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v51", error:"cutover_seal_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });
  app.post("/api/internal/vps/v51/record-restore-drill", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.drill_id || !body.backup_id || !body.result || !guard.ok) return res.status(400).json({ ok:false, version:"v51", error:"invalid_restore_drill", blocked_terms:guard.blocked });
    try { const tx = await withMysqlTransaction(async (conn) => { await conn.execute("INSERT INTO production_cutover_restore_drills_v51 (drill_id, actor_id, backup_id, result, duration_seconds, checksum, drill_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON)) ON DUPLICATE KEY UPDATE result=VALUES(result), duration_seconds=VALUES(duration_seconds), drill_json=VALUES(drill_json)", [body.drill_id, body.actor_id, body.backup_id, body.result, Number(body.duration_seconds ?? 0), body.checksum ?? null, JSON.stringify(body)]); return { drill_id: body.drill_id }; }); res.json({ ok:true, accepted:true, version:"v51", ...tx }); }
    catch (error) { res.status(500).json({ ok:false, version:"v51", error:"restore_drill_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });
  app.post("/api/internal/vps/v51/record-cutover-observation", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.observation_id || !body.metric_name || body.metric_value === undefined || !body.status || !guard.ok) return res.status(400).json({ ok:false, version:"v51", error:"invalid_cutover_observation", blocked_terms:guard.blocked });
    try { const tx = await withMysqlTransaction(async (conn) => { await conn.execute("INSERT INTO production_cutover_observations_v51 (observation_id, actor_id, metric_name, metric_value, status, observation_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [body.observation_id, body.actor_id, body.metric_name, Number(body.metric_value), body.status, JSON.stringify(body)]); return { observation_id: body.observation_id }; }); res.json({ ok:true, accepted:true, version:"v51", ...tx }); }
    catch (error) { res.status(500).json({ ok:false, version:"v51", error:"cutover_observation_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v51/upload-evidence-attachment", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.queue_id || !body.asset_id || !body.evidence_type || !body.file_hash || !body.storage_uri || !body.idempotency_key || !guard.ok) return res.status(400).json({ ok:false, version:"v51", error:"invalid_evidence_upload", blocked_terms:guard.blocked });
    try { const tx = await withMysqlTransaction(async (conn) => { const uploadId = body.upload_id ?? id("evidence-upload-v51", body); await conn.execute("INSERT IGNORE INTO audit_evidence_uploads_v51 (upload_id, queue_id, asset_id, actor_id, evidence_type, file_hash, storage_uri, scan_status, chain_hash, public_release_allowed, upload_json) VALUES (?,?,?,?,?,?,?,?,?,FALSE,CAST(? AS JSON))", [uploadId, body.queue_id, body.asset_id, body.actor_id, body.evidence_type, body.file_hash, body.storage_uri, body.scan_status ?? "pending", body.chain_hash ?? null, JSON.stringify(body)]); return { upload_id: uploadId }; }); res.json({ ok:true, accepted:true, version:"v51", ...tx, public_release_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v51", error:"evidence_upload_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });
  app.post("/api/internal/speech-training/v51/record-attachment-scan", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.upload_id || !body.scan_status || !body.scanner || !body.scan_hash || !guard.ok) return res.status(400).json({ ok:false, version:"v51", error:"invalid_attachment_scan", blocked_terms:guard.blocked });
    try { const tx = await withMysqlTransaction(async (conn) => { const scanId = body.scan_id ?? id("scan-v51", body); await conn.execute("INSERT IGNORE INTO audit_evidence_attachment_scans_v51 (scan_id, upload_id, actor_id, scanner, scan_status, scan_hash, scan_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [scanId, body.upload_id, body.actor_id, body.scanner, body.scan_status, body.scan_hash, JSON.stringify(body)]); return { scan_id: scanId }; }); res.json({ ok:true, accepted:true, version:"v51", ...tx }); }
    catch (error) { res.status(500).json({ ok:false, version:"v51", error:"attachment_scan_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });
  app.post("/api/internal/speech-training/v51/seal-evidence-chain", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.asset_id || !body.chain_hash || body.required_types_complete === undefined || !guard.ok) return res.status(400).json({ ok:false, version:"v51", error:"invalid_evidence_chain_seal", blocked_terms:guard.blocked });
    if (body.required_types_complete !== true) return res.status(400).json({ ok:false, version:"v51", error:"cannot_seal_incomplete_evidence_chain" });
    try { const tx = await withMysqlTransaction(async (conn) => { const sealId = body.seal_id ?? id("evidence-chain-seal-v51", body); await conn.execute("INSERT IGNORE INTO audit_evidence_chain_seals_v51 (seal_id, actor_id, asset_id, chain_hash, required_types_complete, seal_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [sealId, body.actor_id, body.asset_id, body.chain_hash, Boolean(body.required_types_complete), JSON.stringify(body)]); return { seal_id: sealId }; }); res.json({ ok:true, accepted:true, version:"v51", ...tx, public_release_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v51", error:"evidence_chain_seal_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/search/music/v51/record-ab-exposure", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.test_id || !body.variant || !body.query_hash || !body.session_hash || !guard.ok) return res.status(400).json({ ok:false, version:"v51", error:"invalid_ab_exposure", blocked_terms:guard.blocked });
    try { const tx = await withMysqlTransaction(async (conn) => { const exposureId = body.exposure_id ?? id("ab-exposure-v51", body); await conn.execute("INSERT IGNORE INTO music_search_ab_exposures_v51 (exposure_id, test_id, variant, query_hash, session_hash, exposure_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [exposureId, body.test_id, body.variant, body.query_hash, body.session_hash, JSON.stringify(body)]); return { exposure_id: exposureId }; }); res.json({ ok:true, accepted:true, version:"v51", ...tx }); }
    catch (error) { res.status(500).json({ ok:false, version:"v51", error:"ab_exposure_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });
  app.post("/api/internal/search/music/v51/record-ab-metric", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.test_id || !body.variant || !body.metric_name || body.metric_value === undefined || !guard.ok) return res.status(400).json({ ok:false, version:"v51", error:"invalid_ab_metric", blocked_terms:guard.blocked });
    try { const tx = await withMysqlTransaction(async (conn) => { const metricId = body.metric_id ?? id("ab-metric-v51", body); await conn.execute("INSERT IGNORE INTO music_search_ab_metrics_v51 (metric_id, test_id, variant, metric_name, metric_value, metric_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [metricId, body.test_id, body.variant, body.metric_name, Number(body.metric_value), JSON.stringify(body)]); return { metric_id: metricId }; }); res.json({ ok:true, accepted:true, version:"v51", ...tx }); }
    catch (error) { res.status(500).json({ ok:false, version:"v51", error:"ab_metric_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });
  app.post("/api/internal/search/music/v51/merge-synonym-task", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.task_id || !body.decision || !Array.isArray(body.approved_terms) || !guard.ok) return res.status(400).json({ ok:false, version:"v51", error:"invalid_synonym_merge", blocked_terms:guard.blocked });
    try { const tx = await withMysqlTransaction(async (conn) => { const mergeId = body.merge_id ?? id("synonym-merge-v51", body); await conn.execute("INSERT IGNORE INTO music_search_synonym_merges_v51 (merge_id, actor_id, task_id, decision, approved_terms_json, auto_apply_allowed, merge_json) VALUES (?,?,?,?,CAST(? AS JSON),FALSE,CAST(? AS JSON))", [mergeId, body.actor_id, body.task_id, body.decision, JSON.stringify(body.approved_terms), JSON.stringify(body)]); return { merge_id: mergeId }; }); res.json({ ok:true, accepted:true, version:"v51", ...tx, auto_apply_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v51", error:"synonym_merge_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/authority-sources/v51/publish-metadata-card", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.publication_id || body.citation_complete === undefined || body.rights_approved === undefined || !guard.ok) return res.status(400).json({ ok:false, version:"v51", error:"invalid_metadata_card_publish", blocked_terms:guard.blocked });
    if (body.rights_approved !== true || body.citation_complete !== true) return res.status(400).json({ ok:false, version:"v51", error:"metadata_publish_requires_rights_and_citation" });
    try { const tx = await withMysqlTransaction(async (conn) => { await conn.execute("INSERT INTO authority_metadata_live_publications_v51 (publication_id, actor_id, route_path, citation_complete, rights_approved, public_audio_allowed, public_lyrics_allowed, publication_json) VALUES (?,?,?,?,?,FALSE,FALSE,CAST(? AS JSON)) ON DUPLICATE KEY UPDATE citation_complete=VALUES(citation_complete), rights_approved=VALUES(rights_approved), publication_json=VALUES(publication_json)", [body.publication_id, body.actor_id, body.route_path ?? `/music/song/${body.publication_id}`, Boolean(body.citation_complete), Boolean(body.rights_approved), JSON.stringify(body)]); return { publication_id: body.publication_id }; }); res.json({ ok:true, accepted:true, version:"v51", ...tx, public_audio_allowed:false, public_lyrics_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v51", error:"metadata_card_publish_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });
  app.post("/api/internal/authority-sources/v51/record-source-change-notice", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.source_id || !body.event_type || !body.detected_at || !guard.ok) return res.status(400).json({ ok:false, version:"v51", error:"invalid_source_change_notice", blocked_terms:guard.blocked });
    try { const tx = await withMysqlTransaction(async (conn) => { const noticeId = body.notice_id ?? id("source-notice-v51", body); await conn.execute("INSERT IGNORE INTO authority_metadata_source_notices_v51 (notice_id, source_id, event_type, detected_at, notice_json) VALUES (?,?,?,?,CAST(? AS JSON))", [noticeId, body.source_id, body.event_type, body.detected_at, JSON.stringify(body)]); return { notice_id: noticeId }; }); res.json({ ok:true, accepted:true, version:"v51", ...tx }); }
    catch (error) { res.status(500).json({ ok:false, version:"v51", error:"source_change_notice_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });
  app.post("/api/internal/authority-sources/v51/hide-metadata-card", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.publication_id || !body.reason || !guard.ok) return res.status(400).json({ ok:false, version:"v51", error:"invalid_metadata_card_hide", blocked_terms:guard.blocked });
    try { const tx = await withMysqlTransaction(async (conn) => { const hideId = body.hide_id ?? id("metadata-hide-v51", body); await conn.execute("INSERT IGNORE INTO authority_metadata_card_hides_v51 (hide_id, actor_id, publication_id, reason, hidden_from_public, hide_json) VALUES (?,?,?,?,TRUE,CAST(? AS JSON))", [hideId, body.actor_id, body.publication_id, body.reason, JSON.stringify(body)]); return { hide_id: hideId }; }); res.json({ ok:true, accepted:true, version:"v51", ...tx, hidden_from_public:true }); }
    catch (error) { res.status(500).json({ ok:false, version:"v51", error:"metadata_card_hide_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/speech-training/v51/render-governance-pdf", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.renderer || !body.watermark || !body.idempotency_key || !guard.ok) return res.status(400).json({ ok:false, version:"v51", error:"invalid_governance_pdf_render", blocked_terms:guard.blocked });
    try { const tx = await withMysqlTransaction(async (conn) => { const renderId = body.render_id ?? id("pdf-render-v51", body); await conn.execute("INSERT IGNORE INTO speech_model_governance_pdf_renders_v51 (render_id, actor_id, renderer, status, artifact_path, watermark, render_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [renderId, body.actor_id, body.renderer, body.status ?? "queued", body.artifact_path ?? "exports/model_governance_report_v51.pdf", body.watermark, JSON.stringify(body)]); return { render_id: renderId }; }); res.json({ ok:true, accepted:true, version:"v51", ...tx, public_release_allowed:false }); }
    catch (error) { res.status(500).json({ ok:false, version:"v51", error:"governance_pdf_render_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });
  app.post("/api/internal/speech-training/v51/record-signoff-stamp", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.role || !body.decision || !body.stamp_hash || !guard.ok) return res.status(400).json({ ok:false, version:"v51", error:"invalid_signoff_stamp", blocked_terms:guard.blocked });
    try { const tx = await withMysqlTransaction(async (conn) => { const stampId = body.stamp_id ?? id("signoff-stamp-v51", body); await conn.execute("INSERT IGNORE INTO speech_model_governance_signoff_stamps_v51 (stamp_id, actor_id, role, decision, stamp_hash, stamp_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [stampId, body.actor_id, body.role, body.decision, body.stamp_hash, JSON.stringify(body)]); return { stamp_id: stampId }; }); res.json({ ok:true, accepted:true, version:"v51", ...tx }); }
    catch (error) { res.status(500).json({ ok:false, version:"v51", error:"signoff_stamp_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });
  app.post("/api/internal/speech-training/v51/record-model-version-comparison", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.from_version || !body.to_version || !body.diff_hash || !guard.ok) return res.status(400).json({ ok:false, version:"v51", error:"invalid_model_version_comparison", blocked_terms:guard.blocked });
    try { const tx = await withMysqlTransaction(async (conn) => { const comparisonId = body.comparison_id ?? id("model-comparison-v51", body); await conn.execute("INSERT IGNORE INTO speech_model_version_comparisons_v51 (comparison_id, from_version, to_version, diff_hash, comparison_json) VALUES (?,?,?,?,CAST(? AS JSON))", [comparisonId, body.from_version, body.to_version, body.diff_hash, JSON.stringify(body)]); return { comparison_id: comparisonId }; }); res.json({ ok:true, accepted:true, version:"v51", ...tx }); }
    catch (error) { res.status(500).json({ ok:false, version:"v51", error:"model_version_comparison_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.post("/api/internal/site/v51/record-lighthouse-run", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.route_path || body.lcp_ms === undefined || body.inp_ms === undefined || body.cls === undefined || !body.status || !guard.ok) return res.status(400).json({ ok:false, version:"v51", error:"invalid_lighthouse_run", blocked_terms:guard.blocked });
    try { const tx = await withMysqlTransaction(async (conn) => { const runId = body.run_id ?? id("lighthouse-v51", body); await conn.execute("INSERT IGNORE INTO site_lighthouse_runs_v51 (run_id, actor_id, route_path, lcp_ms, inp_ms, cls, status, run_json) VALUES (?,?,?,?,?,?,?,CAST(? AS JSON))", [runId, body.actor_id, body.route_path, Number(body.lcp_ms), Number(body.inp_ms), Number(body.cls), body.status, JSON.stringify(body)]); return { run_id: runId }; }); res.json({ ok:true, accepted:true, version:"v51", ...tx }); }
    catch (error) { res.status(500).json({ ok:false, version:"v51", error:"lighthouse_run_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });
  app.post("/api/internal/site/v51/record-contrast-fix", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.route_path || !body.mode || body.before_ratio === undefined || body.after_ratio === undefined || !guard.ok) return res.status(400).json({ ok:false, version:"v51", error:"invalid_contrast_fix", blocked_terms:guard.blocked });
    try { const tx = await withMysqlTransaction(async (conn) => { const fixId = body.fix_id ?? id("contrast-fix-v51", body); await conn.execute("INSERT IGNORE INTO site_contrast_fixes_v51 (fix_id, actor_id, route_path, mode, before_ratio, after_ratio, fix_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [fixId, body.actor_id, body.route_path, body.mode, Number(body.before_ratio), Number(body.after_ratio), JSON.stringify(body)]); return { fix_id: fixId }; }); res.json({ ok:true, accepted:true, version:"v51", ...tx }); }
    catch (error) { res.status(500).json({ ok:false, version:"v51", error:"contrast_fix_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });
  app.post("/api/internal/site/v51/record-og-sitemap-ping", async (req, res) => {
    const body = req.body ?? {}; const guard = guardText(body);
    if (!body.actor_id || !body.route_path || body.og_ok === undefined || body.sitemap_ok === undefined || !guard.ok) return res.status(400).json({ ok:false, version:"v51", error:"invalid_og_sitemap_ping", blocked_terms:guard.blocked });
    try { const tx = await withMysqlTransaction(async (conn) => { const pingId = body.ping_id ?? id("og-sitemap-ping-v51", body); await conn.execute("INSERT IGNORE INTO site_og_sitemap_pings_v51 (ping_id, actor_id, route_path, og_ok, sitemap_ok, ping_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [pingId, body.actor_id, body.route_path, Boolean(body.og_ok), Boolean(body.sitemap_ok), JSON.stringify(body)]); return { ping_id: pingId }; }); res.json({ ok:true, accepted:true, version:"v51", ...tx }); }
    catch (error) { res.status(500).json({ ok:false, version:"v51", error:"og_sitemap_ping_failed_rolled_back", message:error instanceof Error ? error.message : String(error) }); }
  });

  app.get("/api/ops/vps/v51/preflight-contract", (_req, res) => res.json(readJson("data/ops/vps_preflight_v51.json")));
  app.get("/api/ops/next-upgrade-plan/v52", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v52.json")));
}
