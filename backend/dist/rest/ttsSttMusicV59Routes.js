import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pool } from "../db/client";
function rootDir() { return process.cwd().endsWith("backend") ? path.resolve(process.cwd(), "..") : process.cwd(); }
function readJson(rel) { return JSON.parse(fs.readFileSync(path.join(rootDir(), rel), "utf8")); }
function sha(input) { return crypto.createHash("sha256").update(JSON.stringify(input ?? {})).digest("hex"); }
const blockedTerms = ["卑南文化遺址", "卑南遺址", "卑南考古遺址", "卑南文化公園", "Peinan Site", "Beinan Site", "Peinan Archaeological Site"];
function guardText(body) { const text = JSON.stringify(body ?? {}); const blocked = blockedTerms.filter((term) => text.includes(term)); return { ok: blocked.length === 0, blocked, request_hash: sha(body) }; }
async function withMysqlTransaction(work) { if (!pool)
    return { db_mode: "contract_only_database_url_missing", committed: false, result: null }; const conn = await pool.getConnection(); try {
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
} }
function id(prefix, body) { return `${prefix}-${sha(body).slice(0, 16)}`; }
async function writeEvent(table, key, value, body) { return withMysqlTransaction(async (conn) => { await conn.execute(`INSERT IGNORE INTO ${table} (${key}, actor_id, status, event_json, current_hash) VALUES (?,?,?,?,?)`, [value, body.actor_id ?? "system", body.status ?? "recorded", JSON.stringify(body), sha(body)]); return { [key]: value }; }); }
function validate(body, required) { const guard = guardText(body); const missing = required.filter((key) => body?.[key] === undefined || body?.[key] === null || body?.[key] === ""); return { ok: guard.ok && missing.length === 0, blocked: guard.blocked, missing }; }
export function registerTtsSttMusicV59Routes(app) {
    app.get("/api/admin/music-speech/v59/review-center", (_req, res) => res.json(readJson("data/admin/music_speech_review_center_v59.json")));
    app.get("/api/ops/vps/v59/postseal-validation", (_req, res) => res.json(readJson("data/deployment/release_certificate_postseal_validation_v59.json")));
    app.get("/api/admin/speech-training/v59/dataset-freeze", (_req, res) => res.json(readJson("data/security/legal_speech_dataset_v58_freeze_v59.json")));
    app.get("/api/ops/search/music/v59/production-policy", (_req, res) => res.json(readJson("data/search/music_search_production_policy_v59.json")));
    app.get("/api/ops/authority-sources/v59/publication-expansion", (_req, res) => res.json(readJson("data/integration/authority_metadata_publication_expansion_v59.json")));
    app.get("/api/ops/speech-training/v59/governance-download-hardening", (_req, res) => res.json(readJson("data/audio/speech_governance_download_audit_hardening_v59.json")));
    app.get("/api/ops/site/v59/notification-closed-loop", (_req, res) => res.json(readJson("data/site/operations_notification_closed_loop_v59.json")));
    app.get("/api/ops/vps/v59/preflight-contract", (_req, res) => res.json(readJson("data/ops/vps_preflight_v59.json")));
    app.get("/api/ops/next-upgrade-plan/v60", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v60.json")));
    app.post("/api/internal/vps/v59/record-postseal-validation", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "check_id", "evidence_hash"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.validation_id ?? id("postseal-validation-v59", body);
            const tx = await writeEvent("release_certificate_postseal_validations_v59", "validation_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/vps/v59/record-restore-audit-sample", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "restore_log_hash", "sample_result_hash"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.sample_id ?? id("restore-audit-v59", body);
            const tx = await writeEvent("release_restore_audit_samples_v59", "sample_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/vps/v59/record-rollback-audit-sample", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "rollback_log_hash", "health_hash"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.sample_id ?? id("rollback-audit-v59", body);
            const tx = await writeEvent("release_rollback_audit_samples_v59", "sample_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/vps/v59/record-dns-cloudflare-audit-sample", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "dns_snapshot_hash", "cloudflare_snapshot_hash"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.sample_id ?? id("dns-cloudflare-audit-v59", body);
            const tx = await writeEvent("release_dns_cloudflare_audit_samples_v59", "sample_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/vps/v59/record-observation-audit-sample", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "uptime_hash", "latency_hash"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.sample_id ?? id("observation-audit-v59", body);
            const tx = await writeEvent("release_observation_audit_samples_v59", "sample_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/vps/v59/record-hash-chain-audit-sample", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "previous_hash", "current_hash", "signature"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.sample_id ?? id("hash-chain-audit-v59", body);
            const tx = await writeEvent("release_hash_chain_audit_samples_v59", "sample_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/speech-training/v59/freeze-dataset", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "dataset_version", "freeze_request_id"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.freeze_id ?? id("dataset-freeze-v59", body);
            const tx = await writeEvent("legal_speech_dataset_freezes_v59", "freeze_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/speech-training/v59/export-train-dev-test", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "dataset_version", "export_request_id"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.export_id ?? id("train-dev-test-export-v59", body);
            const tx = await writeEvent("legal_speech_train_dev_test_exports_v59", "export_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/speech-training/v59/write-checksum-manifest", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "dataset_version", "checksum_manifest_hash"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.checksum_id ?? id("checksum-manifest-v59", body);
            const tx = await writeEvent("legal_speech_checksum_manifests_v59", "checksum_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/speech-training/v59/write-model-card", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "dataset_version", "model_card_hash"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.model_card_id ?? id("model-card-v59", body);
            const tx = await writeEvent("legal_speech_model_cards_v59", "model_card_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/speech-training/v59/write-blocked-report", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "dataset_version", "blocked_count"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.report_id ?? id("blocked-report-v59", body);
            const tx = await writeEvent("legal_speech_blocked_reports_v59", "report_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/search/music/v59/apply-production-policy", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "policy_id", "decision_state"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.policy_id ?? id("search-policy-v59", body);
            const tx = await writeEvent("search_production_policies_v59", "policy_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/search/music/v59/write-weekly-report", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "report_window", "metrics_hash"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.report_id ?? id("search-weekly-report-v59", body);
            const tx = await writeEvent("search_quality_weekly_reports_v59", "report_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/search/music/v59/create-anomaly-sla-task", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "trigger", "sla_hours"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.task_id ?? id("search-anomaly-task-v59", body);
            const tx = await writeEvent("search_anomaly_sla_tasks_v59", "task_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/search/music/v59/record-rollback-drill", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "drill_result", "metrics_hash"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.drill_id ?? id("search-rollback-drill-v59", body);
            const tx = await writeEvent("search_rollback_drills_v59", "drill_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/authority/v59/record-publication-expansion", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "source", "metadata_hash"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.record_id ?? id("authority-expansion-v59", body);
            const tx = await writeEvent("authority_metadata_publication_expansions_v59", "record_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/authority/v59/record-citation-screenshot", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "record_id", "screenshot_hash"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.evidence_id ?? id("citation-screenshot-v59", body);
            const tx = await writeEvent("authority_citation_screenshot_evidence_v59", "evidence_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/authority/v59/record-takedown-rehearsal", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "record_id", "rehearsal_log_hash"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.rehearsal_id ?? id("takedown-rehearsal-v59", body);
            const tx = await writeEvent("authority_takedown_rehearsals_v59", "rehearsal_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/authority/v59/record-source-drift-audit", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "record_id", "drift_snapshot_hash"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.audit_id ?? id("source-drift-audit-v59", body);
            const tx = await writeEvent("authority_source_drift_audits_v59", "audit_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/governance/v59/verify-download-watermark", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "artifact_id", "watermark_hash"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.verification_id ?? id("download-watermark-v59", body);
            const tx = await writeEvent("governance_download_watermark_verifications_v59", "verification_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/governance/v59/record-abnormal-download-alert", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "artifact_id", "alert_rule"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.alert_id ?? id("abnormal-download-v59", body);
            const tx = await writeEvent("governance_abnormal_download_alerts_v59", "alert_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/governance/v59/write-rbac-test-report", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "report_hash", "passed"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.report_id ?? id("rbac-test-report-v59", body);
            const tx = await writeEvent("governance_rbac_test_reports_v59", "report_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/governance/v59/sign-audit-export", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "export_id", "signoff_hash"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.signoff_id ?? id("audit-export-signoff-v59", body);
            const tx = await writeEvent("governance_audit_export_signoffs_v59", "signoff_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/ops/v59/ack-notification", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "job_id", "ack_hash"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.ack_id ?? id("notification-ack-v59", body);
            const tx = await writeEvent("operations_notification_acks_v59", "ack_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/ops/v59/escalate-notification", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "job_id", "escalation_reason"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.escalation_id ?? id("notification-escalation-v59", body);
            const tx = await writeEvent("operations_notification_escalations_v59", "escalation_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/ops/v59/close-notification", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "job_id", "closure_hash"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.closure_id ?? id("notification-close-v59", body);
            const tx = await writeEvent("operations_notification_closures_v59", "closure_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/ops/v59/write-weekly-retrospective", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "week", "retrospective_hash"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.retrospective_id ?? id("weekly-retrospective-v59", body);
            const tx = await writeEvent("operations_weekly_retrospectives_v59", "retrospective_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/ops/v59/create-improvement-task", async (req, res) => {
        const body = req.body ?? {};
        const check = validate(body, ["actor_id", "task_title", "source_alert_id"]);
        if (!check.ok)
            return res.status(400).json({ ok: false, version: "v59", error: "invalid_request", missing: check.missing, blocked_terms: check.blocked });
        try {
            const eventId = body.task_id ?? id("improvement-task-v59", body);
            const tx = await writeEvent("operations_improvement_tasks_v59", "task_id", eventId, body);
            res.json({ ok: true, accepted: true, version: "v59", ...tx, production_certified: false, dataset_export_allowed: false, public_audio_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v59", error: "transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
}
