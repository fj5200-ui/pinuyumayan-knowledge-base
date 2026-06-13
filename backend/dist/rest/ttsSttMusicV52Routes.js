import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pool } from "../db/client";
function rootDir() { return process.cwd().endsWith("backend") ? path.resolve(process.cwd(), "..") : process.cwd(); }
function readJson(rel) { return JSON.parse(fs.readFileSync(path.join(rootDir(), rel), "utf8")); }
function sha(input) { return crypto.createHash("sha256").update(JSON.stringify(input ?? {})).digest("hex"); }
const blockedTerms = ["卑南文化遺址", "卑南遺址", "卑南考古遺址", "卑南文化公園", "Peinan Site", "Beinan Site", "Peinan Archaeological Site"];
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
function id(prefix, body) { return `${prefix}-${sha(body).slice(0, 16)}`; }
export function registerTtsSttMusicV52Routes(app) {
    app.get("/api/admin/music-speech/v52/review-center", (_req, res) => res.json(readJson("data/admin/music_speech_review_center_v52.json")));
    app.get("/api/ops/vps/v52/go-live-execution", (_req, res) => res.json(readJson("data/deployment/production_go_live_execution_v52.json")));
    app.get("/api/admin/speech-training/v52/evidence-chain", (_req, res) => res.json(readJson("data/security/audit_evidence_chain_opening_v52.json")));
    app.get("/api/ops/search/music/v52/ab-convergence", (_req, res) => res.json(readJson("data/search/music_search_ab_convergence_v52.json")));
    app.get("/api/ops/authority-sources/v52/public-release", (_req, res) => res.json(readJson("data/integration/authority_metadata_public_release_v52.json")));
    app.get("/api/ops/speech-training/v52/model-signoff", (_req, res) => res.json(readJson("data/audio/speech_model_governance_signoff_v52.json")));
    app.get("/api/ops/site/v52/performance-monitoring", (_req, res) => res.json(readJson("data/site/brand_performance_monitoring_v52.json")));
    app.post("/api/internal/vps/v52/record-go-live-step", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.step_id || !body.environment || !body.status || !body.evidence_bundle_hash || !body.idempotency_key || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_go_live_step", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { await conn.execute("INSERT IGNORE INTO production_go_live_steps_v52 (step_id, actor_id, environment, status, evidence_bundle_hash, idempotency_key, release_blocking, step_json) VALUES (?,?,?,?,?,?,TRUE,CAST(? AS JSON))", [body.step_id, body.actor_id, body.environment, body.status, body.evidence_bundle_hash, body.idempotency_key, JSON.stringify(body)]); return { step_id: body.step_id }; });
            res.json({ ok: true, accepted: true, version: "v52", ...tx, release_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v52", error: "go_live_step_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/vps/v52/record-rollback-evidence", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.environment || !body.rollback_status || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_rollback_evidence", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const rollbackId = body.rollback_id ?? id("rollback-v52", body); await conn.execute("INSERT IGNORE INTO production_go_live_rollback_evidence_v52 (rollback_id, actor_id, environment, rollback_status, artifact_sha256, rollback_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [rollbackId, body.actor_id, body.environment, body.rollback_status, body.artifact_sha256 ?? null, JSON.stringify(body)]); return { rollback_id: rollbackId }; });
            res.json({ ok: true, accepted: true, version: "v52", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v52", error: "rollback_evidence_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/vps/v52/record-observation-sample", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.environment || body.minute_mark === undefined || body.health_ok === undefined || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_observation_sample", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const sampleId = body.sample_id ?? id("observation-v52", body); await conn.execute("INSERT IGNORE INTO production_go_live_observations_v52 (sample_id, actor_id, environment, minute_mark, health_ok, p95_latency_ms, error_rate, sample_json) VALUES (?,?,?,?,?,?,?,CAST(? AS JSON))", [sampleId, body.actor_id, body.environment, Number(body.minute_mark), Boolean(body.health_ok), Number(body.p95_latency_ms ?? 0), Number(body.error_rate ?? 0), JSON.stringify(body)]); return { sample_id: sampleId }; });
            res.json({ ok: true, accepted: true, version: "v52", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v52", error: "observation_sample_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/vps/v52/seal-release-report", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.evidence_bundle_hash || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_release_seal", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const sealId = body.seal_id ?? id("release-seal-v52", body); await conn.execute("INSERT IGNORE INTO production_release_seals_v52 (seal_id, actor_id, evidence_bundle_hash, release_allowed, seal_json) VALUES (?,?,?,?,CAST(? AS JSON))", [sealId, body.actor_id, body.evidence_bundle_hash, Boolean(body.release_allowed ?? false), JSON.stringify(body)]); return { seal_id: sealId }; });
            res.json({ ok: true, accepted: true, version: "v52", ...tx, release_allowed: Boolean(body.release_allowed ?? false) });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v52", error: "release_seal_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/speech-training/v52/create-upload-slot", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.queue_id || !body.asset_id || !body.evidence_type || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_upload_slot", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const slotId = body.slot_id ?? id("evidence-slot-v52", body); await conn.execute("INSERT IGNORE INTO audit_evidence_slots_v52 (slot_id, queue_id, asset_id, actor_id, evidence_type, upload_url, expires_at, slot_json) VALUES (?,?,?,?,?,?,?,CAST(? AS JSON))", [slotId, body.queue_id, body.asset_id, body.actor_id, body.evidence_type, body.upload_url ?? null, body.expires_at ?? null, JSON.stringify(body)]); return { slot_id: slotId }; });
            res.json({ ok: true, accepted: true, version: "v52", ...tx, public_release_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v52", error: "upload_slot_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/speech-training/v52/record-virus-scan", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.slot_id || !body.scanner || !body.scan_status || !body.file_hash || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_virus_scan", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const scanId = body.scan_id ?? id("scan-v52", body); await conn.execute("INSERT IGNORE INTO audit_evidence_scans_v52 (scan_id, slot_id, actor_id, scanner, scan_status, file_hash, scan_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [scanId, body.slot_id, body.actor_id, body.scanner, body.scan_status, body.file_hash, JSON.stringify(body)]); return { scan_id: scanId }; });
            res.json({ ok: true, accepted: true, version: "v52", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v52", error: "virus_scan_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/speech-training/v52/seal-asset-evidence", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.asset_id || !body.chain_hash || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_asset_evidence_seal", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const sealId = body.seal_id ?? id("asset-seal-v52", body); await conn.execute("INSERT IGNORE INTO audit_asset_evidence_seals_v52 (seal_id, actor_id, asset_id, chain_hash, required_types_complete, public_release_allowed, seal_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [sealId, body.actor_id, body.asset_id, body.chain_hash, Boolean(body.required_types_complete ?? false), Boolean(body.public_release_allowed ?? false), JSON.stringify(body)]); return { seal_id: sealId }; });
            res.json({ ok: true, accepted: true, version: "v52", ...tx, public_release_allowed: Boolean(body.public_release_allowed ?? false) });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v52", error: "asset_evidence_seal_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/speech-training/v52/create-training-batch", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.batch_id || body.eligible_asset_count === undefined || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_training_batch", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { await conn.execute("INSERT IGNORE INTO audit_training_batches_v52 (batch_id, actor_id, eligible_asset_count, speaker_leakage_check_passed, export_allowed, batch_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [body.batch_id, body.actor_id, Number(body.eligible_asset_count), Boolean(body.speaker_leakage_check_passed ?? false), Boolean(body.export_allowed ?? false), JSON.stringify(body)]); return { batch_id: body.batch_id }; });
            res.json({ ok: true, accepted: true, version: "v52", ...tx, export_allowed: Boolean(body.export_allowed ?? false) });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v52", error: "training_batch_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/search/music/v52/record-convergence-metric", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.test_id || !body.variant || body.sample_size === undefined || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_convergence_metric", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const metricId = body.metric_id ?? id("ab-convergence-v52", body); await conn.execute("INSERT IGNORE INTO music_search_ab_convergence_metrics_v52 (metric_id, test_id, variant, sample_size, zero_result_recovery_rate, p95_latency_ms, metric_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [metricId, body.test_id, body.variant, Number(body.sample_size), Number(body.zero_result_recovery_rate ?? 0), Number(body.p95_latency_ms ?? 0), JSON.stringify(body)]); return { metric_id: metricId }; });
            res.json({ ok: true, accepted: true, version: "v52", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v52", error: "convergence_metric_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/search/music/v52/decide-ab-test", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.test_id || !body.decision || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_ab_decision", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const decisionId = body.decision_id ?? id("ab-decision-v52", body); await conn.execute("INSERT IGNORE INTO music_search_variant_decisions_v52 (decision_id, actor_id, test_id, decision, auto_rollout_allowed, decision_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [decisionId, body.actor_id, body.test_id, body.decision, Boolean(body.auto_rollout_allowed ?? false), JSON.stringify(body)]); return { decision_id: decisionId }; });
            res.json({ ok: true, accepted: true, version: "v52", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v52", error: "ab_decision_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/search/music/v52/rollout-search-variant", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.variant || body.rollout_percent === undefined || !body.status || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_search_rollout", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const rolloutId = body.rollout_id ?? id("search-rollout-v52", body); await conn.execute("INSERT IGNORE INTO music_search_variant_rollouts_v52 (rollout_id, actor_id, variant, rollout_percent, status, rollout_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [rolloutId, body.actor_id, body.variant, Number(body.rollout_percent), body.status, JSON.stringify(body)]); return { rollout_id: rolloutId }; });
            res.json({ ok: true, accepted: true, version: "v52", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v52", error: "search_rollout_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/search/music/v52/rollback-search-variant", async (req, res) => {
        const body = { ...(req.body ?? {}), status: "rolled_back", rollout_percent: 0 };
        req.body = body;
        const guard = guardText(body);
        if (!guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_search_variant_rollback", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const rolloutId = body.rollout_id ?? id("search-rollback-v52", body); await conn.execute("INSERT IGNORE INTO music_search_variant_rollouts_v52 (rollout_id, actor_id, variant, rollout_percent, status, rollout_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [rolloutId, body.actor_id, body.variant, 0, "rolled_back", JSON.stringify(body)]); return { rollout_id: rolloutId }; });
            res.json({ ok: true, accepted: true, version: "v52", ...tx, rolled_back: true });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v52", error: "search_rollback_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/authority-sources/v52/approve-metadata-release", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.publication_id || body.citation_score === undefined || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_metadata_approval", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const approvalId = body.approval_id ?? id("authority-approval-v52", body); await conn.execute("INSERT IGNORE INTO authority_metadata_release_approvals_v52 (approval_id, actor_id, publication_id, rights_approved, citation_score, approval_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [approvalId, body.actor_id, body.publication_id, Boolean(body.rights_approved ?? false), Number(body.citation_score), JSON.stringify(body)]); return { approval_id: approvalId }; });
            res.json({ ok: true, accepted: true, version: "v52", ...tx, public_audio_allowed: false, public_lyrics_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v52", error: "metadata_approval_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/authority-sources/v52/index-metadata-card", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.publication_id || !body.route_path || !body.index_status || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_metadata_index_job", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const jobId = body.index_job_id ?? id("metadata-index-v52", body); await conn.execute("INSERT IGNORE INTO authority_metadata_index_jobs_v52 (index_job_id, publication_id, route_path, index_status, index_json) VALUES (?,?,?,?,CAST(? AS JSON))", [jobId, body.publication_id, body.route_path, body.index_status, JSON.stringify(body)]); return { index_job_id: jobId }; });
            res.json({ ok: true, accepted: true, version: "v52", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v52", error: "metadata_index_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/authority-sources/v52/record-source-drift", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.source_id || !body.event_type || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_source_drift", blocked_terms: guard.blocked });
        res.json({ ok: true, accepted: true, version: "v52", source_id: body.source_id, event_type: body.event_type, monitoring_only: true });
    });
    app.post("/api/internal/authority-sources/v52/takedown-metadata-card", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.publication_id || !body.reason || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_metadata_takedown", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const takedownId = body.takedown_id ?? id("metadata-takedown-v52", body); await conn.execute("INSERT IGNORE INTO authority_metadata_takedowns_v52 (takedown_id, actor_id, publication_id, reason, hidden_from_public, takedown_json) VALUES (?,?,?,?,TRUE,CAST(? AS JSON))", [takedownId, body.actor_id, body.publication_id, body.reason, JSON.stringify(body)]); return { takedown_id: takedownId }; });
            res.json({ ok: true, accepted: true, version: "v52", ...tx, hidden_from_public: true });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v52", error: "metadata_takedown_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/speech-training/v52/render-watermarked-pdf", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.renderer || !body.artifact_path || !body.watermark || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_watermarked_pdf", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const pdfId = body.pdf_id ?? id("watermarked-pdf-v52", body); await conn.execute("INSERT IGNORE INTO speech_model_watermarked_pdfs_v52 (pdf_id, actor_id, renderer, artifact_path, watermark, status, pdf_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [pdfId, body.actor_id, body.renderer, body.artifact_path, body.watermark, body.status ?? "rendered", JSON.stringify(body)]); return { pdf_id: pdfId }; });
            res.json({ ok: true, accepted: true, version: "v52", ...tx, public_release_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v52", error: "watermarked_pdf_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/speech-training/v52/record-lineage-graph", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.graph_hash || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_lineage_graph", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const graphId = body.graph_id ?? id("lineage-graph-v52", body); await conn.execute("INSERT IGNORE INTO speech_model_lineage_graphs_v52 (graph_id, actor_id, graph_hash, node_count, graph_json) VALUES (?,?,?,?,CAST(? AS JSON))", [graphId, body.actor_id, body.graph_hash, Number(body.node_count ?? 0), JSON.stringify(body)]); return { graph_id: graphId }; });
            res.json({ ok: true, accepted: true, version: "v52", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v52", error: "lineage_graph_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/speech-training/v52/record-version-diff", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.from_version || !body.to_version || !body.diff_hash || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_version_diff", blocked_terms: guard.blocked });
        res.json({ ok: true, accepted: true, version: "v52", diff_id: body.diff_id ?? id("version-diff-v52", body), public_release_allowed: false });
    });
    app.post("/api/internal/speech-training/v52/close-model-blocker", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.blocker_id || !body.reason || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_model_blocker_close", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { await conn.execute("INSERT IGNORE INTO speech_model_release_blockers_v52 (blocker_id, actor_id, blocker_status, reason, blocker_json) VALUES (?,?,?,?,CAST(? AS JSON))", [body.blocker_id, body.actor_id, body.blocker_status ?? "close_requested", body.reason, JSON.stringify(body)]); return { blocker_id: body.blocker_id }; });
            res.json({ ok: true, accepted: true, version: "v52", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v52", error: "model_blocker_close_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/site/v52/record-lighthouse-cwv", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.route_path || body.lcp_ms === undefined || body.inp_ms === undefined || body.cls === undefined || !body.status || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_lighthouse_cwv", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const runId = body.run_id ?? id("lighthouse-cwv-v52", body); await conn.execute("INSERT IGNORE INTO site_lighthouse_cwv_runs_v52 (run_id, actor_id, route_path, lcp_ms, inp_ms, cls, performance_score, accessibility_score, status, run_json) VALUES (?,?,?,?,?,?,?,?,?,CAST(? AS JSON))", [runId, body.actor_id, body.route_path, Number(body.lcp_ms), Number(body.inp_ms), Number(body.cls), Number(body.performance_score ?? 0), Number(body.accessibility_score ?? 0), body.status, JSON.stringify(body)]); return { run_id: runId }; });
            res.json({ ok: true, accepted: true, version: "v52", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v52", error: "lighthouse_cwv_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/site/v52/record-browser-screenshot", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.route_path || !body.viewport || !body.screenshot_hash || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_browser_screenshot", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const screenshotId = body.screenshot_id ?? id("screenshot-v52", body); await conn.execute("INSERT IGNORE INTO site_browser_screenshots_v52 (screenshot_id, actor_id, route_path, viewport, screenshot_hash, screenshot_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [screenshotId, body.actor_id, body.route_path, body.viewport, body.screenshot_hash, JSON.stringify(body)]); return { screenshot_id: screenshotId }; });
            res.json({ ok: true, accepted: true, version: "v52", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v52", error: "browser_screenshot_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/site/v52/record-og-check", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.route_path || body.og_ok === undefined || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_og_check", blocked_terms: guard.blocked });
        res.json({ ok: true, accepted: true, version: "v52", check_id: body.check_id ?? id("og-check-v52", body) });
    });
    app.post("/api/internal/site/v52/record-sitemap-ping", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.actor_id || !body.route_path || body.sitemap_ok === undefined || !guard.ok)
            return res.status(400).json({ ok: false, version: "v52", error: "invalid_sitemap_ping", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => { const checkId = body.check_id ?? id("og-sitemap-v52", body); await conn.execute("INSERT IGNORE INTO site_og_sitemap_checks_v52 (check_id, actor_id, route_path, og_ok, sitemap_ok, check_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [checkId, body.actor_id, body.route_path, Boolean(body.og_ok ?? false), Boolean(body.sitemap_ok), JSON.stringify(body)]); return { check_id: checkId }; });
            res.json({ ok: true, accepted: true, version: "v52", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v52", error: "sitemap_ping_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.get("/api/ops/vps/v52/preflight-contract", (_req, res) => res.json(readJson("data/ops/vps_preflight_v52.json")));
    app.get("/api/ops/next-upgrade-plan/v53", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v53.json")));
}
