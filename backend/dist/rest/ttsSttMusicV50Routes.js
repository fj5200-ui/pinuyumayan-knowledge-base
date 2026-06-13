import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pool } from "../db/client";
function rootDir() { return process.cwd().endsWith("backend") ? path.resolve(process.cwd(), "..") : process.cwd(); }
function readJson(rel) { return JSON.parse(fs.readFileSync(path.join(rootDir(), rel), "utf8")); }
function sha(input) { return crypto.createHash("sha256").update(JSON.stringify(input ?? {})).digest("hex"); }
const blockedTerms = ["卑南文化遺址", "卑南遺址", "卑南考古遺址", "卑南文化公園", "Peinan Site", "Beinan Site", "Peinan Archaeological Site"];
const workbenchActions = new Set(["record_evidence", "signoff_evidence", "export_evidence", "render_pdf", "close_blocker"]);
function guardText(body) { const text = JSON.stringify(body ?? {}); const blocked = blockedTerms.filter((term) => text.includes(term)); return { ok: blocked.length === 0, blocked, request_hash: sha(body) }; }
async function withMysqlTransaction(work) {
    if (!pool)
        return { db_mode: "contract_only_database_url_missing", committed: false, result: null };
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const result = await work(conn);
        await conn.commit();
        return { db_mode: "mysql_transaction", committed: true, result };
    }
    catch (error) {
        await conn.rollback();
        throw error;
    }
    finally {
        conn.release();
    }
}
export function registerTtsSttMusicV50Routes(app) {
    app.get("/api/admin/music-speech/v50/review-center", (_req, res) => res.json(readJson("data/admin/music_speech_review_center_v50.json")));
    app.get("/api/ops/vps/v50/cutover-plan", (_req, res) => res.json(readJson("data/deployment/production_cutover_v50.json")));
    app.post("/api/internal/vps/v50/record-cutover-run", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.run_id || !body.deployment_mode || !guard.ok)
            return res.status(400).json({ ok: false, version: "v50", error: "invalid_cutover_run", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { await conn.execute("INSERT INTO production_cutover_runs_v50 (run_id, deployment_mode, status, git_sha, artifact_sha256, traffic_weight, release_allowed, run_json) VALUES (?,?,?,?,?,?,FALSE,CAST(? AS JSON)) ON DUPLICATE KEY UPDATE status=VALUES(status), traffic_weight=VALUES(traffic_weight), run_json=VALUES(run_json)", [body.run_id, body.deployment_mode, body.status ?? "recorded", body.git_sha ?? null, body.artifact_sha256 ?? null, Number(body.traffic_weight ?? 0), JSON.stringify(body)]); return { run_id: body.run_id }; });
            res.json({ ok: true, accepted: true, version: "v50", ...tx, release_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v50", error: "cutover_run_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/vps/v50/record-health-check", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.run_id || !body.check_id || !body.path || !guard.ok)
            return res.status(400).json({ ok: false, version: "v50", error: "invalid_health_check", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const id = body.check_result_id ?? `health-v50-${guard.request_hash.slice(0, 16)}`; await conn.execute("INSERT IGNORE INTO production_cutover_health_checks_v50 (check_result_id, run_id, check_id, path, status_code, healthy, latency_ms, check_json) VALUES (?,?,?,?,?,?,?,CAST(? AS JSON))", [id, body.run_id, body.check_id, body.path, Number(body.status_code ?? 0), Boolean(body.healthy), Number(body.latency_ms ?? 0), JSON.stringify(body)]); return { check_result_id: id }; });
            res.json({ ok: true, accepted: true, version: "v50", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v50", error: "health_check_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/vps/v50/record-dns-cutover", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.zone_id || !body.dns_record_id || !guard.ok)
            return res.status(400).json({ ok: false, version: "v50", error: "invalid_dns_cutover", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const id = body.event_id ?? `dns-cutover-v50-${guard.request_hash.slice(0, 16)}`; await conn.execute("INSERT IGNORE INTO production_cutover_dns_events_v50 (event_id, actor_id, zone_id, dns_record_id, old_value, new_value, ttl_seconds, approved, event_json) VALUES (?,?,?,?,?,?,?,?,CAST(? AS JSON))", [id, body.actor_id, body.zone_id, body.dns_record_id, body.old_value ?? null, body.new_value ?? null, Number(body.ttl_seconds ?? 300), Boolean(body.approved), JSON.stringify(body)]); return { event_id: id }; });
            res.json({ ok: true, accepted: true, version: "v50", ...tx, requires_cloudflare_confirmation: true });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v50", error: "dns_cutover_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/vps/v50/record-rollback-rehearsal", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.backup_id || !body.result || !guard.ok)
            return res.status(400).json({ ok: false, version: "v50", error: "invalid_rollback_rehearsal", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const id = body.rehearsal_id ?? `rollback-v50-${guard.request_hash.slice(0, 16)}`; await conn.execute("INSERT IGNORE INTO production_rollback_rehearsals_v50 (rehearsal_id, actor_id, backup_id, previous_artifact_sha256, duration_seconds, result, rehearsal_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [id, body.actor_id, body.backup_id, body.previous_artifact_sha256 ?? null, Number(body.duration_seconds ?? 0), body.result, JSON.stringify(body)]); return { rehearsal_id: id }; });
            res.json({ ok: true, accepted: true, version: "v50", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v50", error: "rollback_rehearsal_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.get("/api/admin/speech-training/v50/evidence-store", (_req, res) => res.json(readJson("data/security/audit_evidence_store_v50.json")));
    app.post("/api/internal/speech-training/v50/record-evidence", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.queue_id || !body.asset_id || !body.evidence_type || !body.evidence_hash || !body.idempotency_key || !guard.ok)
            return res.status(400).json({ ok: false, version: "v50", error: "invalid_evidence_payload", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const id = body.evidence_id ?? `evidence-v50-${guard.request_hash.slice(0, 16)}`; const chainHash = sha({ previous: body.previous_chain_hash ?? null, evidence: body.evidence_hash, payload: body }); await conn.execute("INSERT IGNORE INTO audit_evidence_store_v50 (evidence_id, queue_id, asset_id, evidence_type, evidence_hash, chain_hash, previous_chain_hash, storage_uri, scan_status, public_release_allowed, evidence_json) VALUES (?,?,?,?,?,?,?,?,?,FALSE,CAST(? AS JSON))", [id, body.queue_id, body.asset_id, body.evidence_type, body.evidence_hash, chainHash, body.previous_chain_hash ?? null, body.storage_uri ?? null, body.scan_status ?? "pending", JSON.stringify(body)]); return { evidence_id: id, chain_hash: chainHash }; });
            res.json({ ok: true, accepted: true, version: "v50", ...tx, public_release_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v50", error: "record_evidence_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/speech-training/v50/signoff-evidence", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.evidence_id || !body.signoff_role || !body.decision || !body.idempotency_key || !guard.ok)
            return res.status(400).json({ ok: false, version: "v50", error: "invalid_evidence_signoff", blocked_terms: guard.blocked });
        if (body.decision === "approve_release" && body.all_required_evidence_complete !== true)
            return res.status(400).json({ ok: false, version: "v50", error: "approve_release_requires_all_evidence_complete" });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const id = body.signoff_id ?? `signoff-v50-${guard.request_hash.slice(0, 16)}`; await conn.execute("INSERT IGNORE INTO audit_evidence_signoffs_v50 (signoff_id, evidence_id, actor_id, signoff_role, decision, idempotency_key, signoff_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [id, body.evidence_id, body.actor_id, body.signoff_role, body.decision, body.idempotency_key, JSON.stringify(body)]); return { signoff_id: id }; });
            res.json({ ok: true, accepted: true, version: "v50", ...tx, public_release_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v50", error: "signoff_evidence_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/speech-training/v50/export-evidence", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.export_format || !body.scope || !guard.ok)
            return res.status(400).json({ ok: false, version: "v50", error: "invalid_evidence_export", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const id = body.export_id ?? `evidence-export-v50-${guard.request_hash.slice(0, 16)}`; await conn.execute("INSERT IGNORE INTO audit_evidence_export_jobs_v50 (export_id, actor_id, export_format, scope, status, artifact_path, export_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [id, body.actor_id, body.export_format, body.scope, body.status ?? "queued", body.artifact_path ?? null, JSON.stringify(body)]); return { export_id: id }; });
            res.json({ ok: true, accepted: true, version: "v50", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v50", error: "export_evidence_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.get("/api/ops/search/music/v50/intelligence", (_req, res) => res.json(readJson("data/search/music_search_intelligence_v50.json")));
    app.post("/api/internal/search/music/v50/review-synonym-task", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.task_id || !body.decision || !guard.ok)
            return res.status(400).json({ ok: false, version: "v50", error: "invalid_synonym_review", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { await conn.execute("INSERT INTO music_search_synonym_review_tasks_v50 (task_id, source_suggestion_id, query_text, candidate_terms_json, decision, reviewer_id, auto_apply_allowed, task_json) VALUES (?,?,?,?,?,?,FALSE,CAST(? AS JSON)) ON DUPLICATE KEY UPDATE decision=VALUES(decision), reviewer_id=VALUES(reviewer_id), task_json=VALUES(task_json)", [body.task_id, body.source_suggestion_id ?? null, body.query_text ?? "", JSON.stringify(body.candidate_terms ?? []), body.decision, body.actor_id, JSON.stringify(body)]); return { task_id: body.task_id }; });
            res.json({ ok: true, accepted: true, version: "v50", ...tx, auto_apply_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v50", error: "synonym_review_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/search/music/v50/record-ab-test", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.test_id || !body.variant_a || !body.variant_b || !guard.ok)
            return res.status(400).json({ ok: false, version: "v50", error: "invalid_ab_test", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { await conn.execute("INSERT INTO music_search_ab_tests_v50 (test_id, variant_a, variant_b, traffic_percent, status, result_json) VALUES (?,?,?,?,?,CAST(? AS JSON)) ON DUPLICATE KEY UPDATE status=VALUES(status), result_json=VALUES(result_json)", [body.test_id, body.variant_a, body.variant_b, Number(body.traffic_percent ?? 0), body.status ?? "draft_requires_approval", JSON.stringify(body)]); return { test_id: body.test_id }; });
            res.json({ ok: true, accepted: true, version: "v50", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v50", error: "ab_test_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/search/music/v50/record-intent-classification", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.query_text || !body.intent || !guard.ok)
            return res.status(400).json({ ok: false, version: "v50", error: "invalid_intent_classification", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const id = body.classification_id ?? `intent-v50-${guard.request_hash.slice(0, 16)}`; await conn.execute("INSERT IGNORE INTO music_search_intent_classifications_v50 (classification_id, query_text, intent, confidence, route_target, classification_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [id, body.query_text, body.intent, Number(body.confidence ?? 0), body.route_target ?? null, JSON.stringify(body)]); return { classification_id: id }; });
            res.json({ ok: true, accepted: true, version: "v50", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v50", error: "intent_classification_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.get("/api/ops/authority-sources/v50/metadata-publication", (_req, res) => res.json(readJson("data/integration/authority_metadata_publication_v50.json")));
    app.post("/api/internal/authority-sources/v50/publish-metadata-only", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.publication_id || !body.candidate_id || !guard.ok)
            return res.status(400).json({ ok: false, version: "v50", error: "invalid_metadata_publication", blocked_terms: guard.blocked });
        if (body.public_audio_allowed === true || body.public_lyrics_allowed === true)
            return res.status(400).json({ ok: false, version: "v50", error: "v50_metadata_only_disallows_audio_and_lyrics" });
        try {
            const tx = await withMysqlTransaction(async (conn) => { await conn.execute("INSERT INTO authority_metadata_publication_queue_v50 (publication_id, candidate_id, publish_mode, status, citation_score, public_audio_allowed, public_lyrics_allowed, publication_json) VALUES (?,?,?,?,?,FALSE,FALSE,CAST(? AS JSON)) ON DUPLICATE KEY UPDATE status=VALUES(status), publication_json=VALUES(publication_json)", [body.publication_id, body.candidate_id, "metadata_only", body.status ?? "pending_rights_review", Number(body.citation_score ?? 0), JSON.stringify(body)]); return { publication_id: body.publication_id }; });
            res.json({ ok: true, accepted: true, version: "v50", ...tx, public_audio_allowed: false, public_lyrics_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v50", error: "metadata_publication_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/authority-sources/v50/record-source-notification", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.source_id || !body.event_type || !guard.ok)
            return res.status(400).json({ ok: false, version: "v50", error: "invalid_source_notification", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const id = body.notification_id ?? `source-note-v50-${guard.request_hash.slice(0, 16)}`; await conn.execute("INSERT IGNORE INTO authority_source_change_notifications_v50 (notification_id, source_id, event_type, etag, last_modified, notification_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [id, body.source_id, body.event_type, body.etag ?? null, body.last_modified ?? null, JSON.stringify(body)]); return { notification_id: id }; });
            res.json({ ok: true, accepted: true, version: "v50", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v50", error: "source_notification_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/authority-sources/v50/takedown-request", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.publication_id || !body.reason || !guard.ok)
            return res.status(400).json({ ok: false, version: "v50", error: "invalid_takedown_request", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const id = body.request_id ?? `takedown-v50-${guard.request_hash.slice(0, 16)}`; await conn.execute("INSERT IGNORE INTO authority_metadata_takedown_requests_v50 (request_id, publication_id, requester_contact, reason, status, hidden_from_public, request_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [id, body.publication_id, body.requester_contact ?? null, body.reason, body.status ?? "received", Boolean(body.hidden_from_public ?? true), JSON.stringify(body)]); return { request_id: id }; });
            res.json({ ok: true, accepted: true, version: "v50", ...tx, hidden_from_public_default: true });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v50", error: "takedown_request_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.get("/api/ops/speech-training/v50/governance-delivery", (_req, res) => res.json(readJson("data/audio/speech_model_governance_delivery_v50.json")));
    app.post("/api/internal/speech-training/v50/render-governance-pdf", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.export_format || !guard.ok)
            return res.status(400).json({ ok: false, version: "v50", error: "invalid_pdf_render", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const id = body.export_id ?? `model-delivery-v50-${guard.request_hash.slice(0, 16)}`; await conn.execute("INSERT IGNORE INTO speech_model_governance_delivery_exports_v50 (export_id, actor_id, export_format, status, artifact_path, watermark, export_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [id, body.actor_id, body.export_format, body.status ?? "queued", body.artifact_path ?? "exports/model_governance_report_v50.pdf", body.watermark ?? "BLOCKED - evidence incomplete", JSON.stringify(body)]); return { export_id: id }; });
            res.json({ ok: true, accepted: true, version: "v50", ...tx, public_release_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v50", error: "pdf_render_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/speech-training/v50/record-version-diff", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.from_version || !body.to_version || !guard.ok)
            return res.status(400).json({ ok: false, version: "v50", error: "invalid_version_diff", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const id = body.diff_id ?? `model-diff-v50-${guard.request_hash.slice(0, 16)}`; await conn.execute("INSERT IGNORE INTO speech_model_version_diffs_v50 (diff_id, from_version, to_version, change_summary, risk, diff_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [id, body.from_version, body.to_version, body.change_summary ?? null, body.risk ?? "unknown", JSON.stringify(body)]); return { diff_id: id }; });
            res.json({ ok: true, accepted: true, version: "v50", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v50", error: "version_diff_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/speech-training/v50/close-release-blocker", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.blocker_id || !body.closure_status || !guard.ok)
            return res.status(400).json({ ok: false, version: "v50", error: "invalid_blocker_closure", blocked_terms: guard.blocked });
        if (body.closure_status === "closed" && body.evidence_store_complete !== true)
            return res.status(400).json({ ok: false, version: "v50", error: "blocker_close_requires_evidence_store_complete" });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const id = body.closure_id ?? `blocker-closure-v50-${guard.request_hash.slice(0, 16)}`; await conn.execute("INSERT IGNORE INTO speech_model_release_blocker_closures_v50 (closure_id, blocker_id, actor_id, closure_status, affected_assets, closure_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [id, body.blocker_id, body.actor_id, body.closure_status, Number(body.affected_assets ?? 0), JSON.stringify(body)]); return { closure_id: id }; });
            res.json({ ok: true, accepted: true, version: "v50", ...tx, public_release_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v50", error: "blocker_closure_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.get("/api/ops/site/v50/brand-completion", (_req, res) => res.json(readJson("data/site/frontstage_brand_completion_v50.json")));
    app.post("/api/internal/site/v50/record-browser-screenshot", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.route_path || !body.viewport || !body.mode || !body.status || !guard.ok)
            return res.status(400).json({ ok: false, version: "v50", error: "invalid_browser_screenshot", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const id = body.validation_id ?? `browser-shot-v50-${guard.request_hash.slice(0, 16)}`; await conn.execute("INSERT IGNORE INTO site_browser_screenshot_validations_v50 (validation_id, route_path, viewport, mode, screenshot_path, status, validation_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [id, body.route_path, body.viewport, body.mode, body.screenshot_path ?? null, body.status, JSON.stringify(body)]); return { validation_id: id }; });
            res.json({ ok: true, accepted: true, version: "v50", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v50", error: "browser_screenshot_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/site/v50/record-cwv-run", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.route_path || !body.status || !guard.ok)
            return res.status(400).json({ ok: false, version: "v50", error: "invalid_cwv_run", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const id = body.run_id ?? `cwv-v50-${guard.request_hash.slice(0, 16)}`; await conn.execute("INSERT IGNORE INTO site_core_web_vitals_runs_v50 (run_id, route_path, lcp_ms, inp_ms, cls, status, run_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [id, body.route_path, Number(body.lcp_ms ?? 0), Number(body.inp_ms ?? 0), Number(body.cls ?? 0), body.status, JSON.stringify(body)]); return { run_id: id }; });
            res.json({ ok: true, accepted: true, version: "v50", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v50", error: "cwv_run_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/site/v50/record-seo-og-monitor", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.route_path || !body.status || !guard.ok)
            return res.status(400).json({ ok: false, version: "v50", error: "invalid_seo_og_monitor", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const id = body.monitor_id ?? `seo-og-v50-${guard.request_hash.slice(0, 16)}`; await conn.execute("INSERT IGNORE INTO site_seo_og_monitors_v50 (monitor_id, route_path, status, title_ok, description_ok, og_image_ok, json_ld_ok, monitor_json) VALUES (?,?,?,?,?,?,?,CAST(? AS JSON))", [id, body.route_path, body.status, Boolean(body.title_ok), Boolean(body.description_ok), Boolean(body.og_image_ok), Boolean(body.json_ld_ok), JSON.stringify(body)]); return { monitor_id: id }; });
            res.json({ ok: true, accepted: true, version: "v50", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v50", error: "seo_og_monitor_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.get("/api/ops/vps/v50/preflight-contract", (_req, res) => res.json(readJson("data/ops/vps_preflight_v50.json")));
    app.get("/api/ops/next-upgrade-plan/v51", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v51.json")));
}
