import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pool } from "../db/client";
function rootDir() {
    return process.cwd().endsWith("backend") ? path.resolve(process.cwd(), "..") : process.cwd();
}
function readJson(rel) {
    return JSON.parse(fs.readFileSync(path.join(rootDir(), rel), "utf8"));
}
function sha(input) {
    return crypto.createHash("sha256").update(JSON.stringify(input ?? {})).digest("hex");
}
const blockedTerms = ["卑南文化遺址", "卑南遺址", "卑南考古遺址", "卑南文化公園", "Peinan Site", "Beinan Site", "Peinan Archaeological Site"];
const allowedReviewDecisions = new Set(["approve_gate", "reject_gate", "return_for_fix"]);
const allowedModelDecisions = new Set(["block_release", "return_for_fix", "approve_internal_experiment_only"]);
function guardText(body) {
    const text = JSON.stringify(body ?? {});
    const blocked = blockedTerms.filter((term) => text.includes(term));
    return { ok: blocked.length === 0, blocked, request_hash: sha(body) };
}
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
export function registerTtsSttMusicV46Routes(app) {
    app.get("/api/ops/speech-training/v46/reviewer-queue", (_req, res) => res.json({ queue: readJson("data/audio/speech_reviewer_queue_v46.json"), transaction_contract: readJson("data/database/vps_tts_stt_transaction_contract_v46.json") }));
    app.post("/api/internal/speech-training/v46/assign-reviewer", async (req, res) => {
        const body = req.body ?? {};
        const missing = ["queue_id", "asset_id", "reviewer_id", "assigned_by"].filter((key) => !body[key]);
        const guard = guardText(body);
        if (missing.length || !guard.ok)
            return res.status(400).json({ ok: false, version: "v46", error: "invalid_assignment", missing, blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => {
                await conn.execute("UPDATE speech_reviewer_queue_v46 SET assigned_reviewer_id=?, assigned_by=?, assigned_at=NOW(), due_at=DATE_ADD(NOW(), INTERVAL 72 HOUR), queue_status='assigned' WHERE queue_id=? AND asset_id=?", [body.reviewer_id, body.assigned_by, body.queue_id, body.asset_id]);
                await conn.execute("INSERT IGNORE INTO speech_review_sla_events_v46 (event_id, queue_id, asset_id, event_type, actor_id, event_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [`sla-v46-${guard.request_hash.slice(0, 16)}`, body.queue_id, body.asset_id, "assigned", body.assigned_by, JSON.stringify(body)]);
                return { queue_id: body.queue_id, assigned_reviewer_id: body.reviewer_id };
            });
            res.json({ ok: true, accepted: true, version: "v46", assignment_id: `assign-v46-${guard.request_hash.slice(0, 16)}`, ...tx, public_release_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v46", error: "assignment_transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/speech-training/v46/transactional-review-decision", async (req, res) => {
        const body = req.body ?? {};
        const decision = String(body.decision ?? "");
        const missing = ["queue_id", "asset_id", "reviewer_id", "decision", "decision_reason", "idempotency_key"].filter((key) => !body[key]);
        const guard = guardText(body);
        if (missing.length || !allowedReviewDecisions.has(decision) || !guard.ok)
            return res.status(400).json({ ok: false, version: "v46", error: "invalid_review_decision", missing, allowed_decisions: [...allowedReviewDecisions], blocked_terms: guard.blocked });
        if (decision === "approve_gate" && !body.evidence_attachment_ids?.length)
            return res.status(400).json({ ok: false, version: "v46", error: "approve_requires_evidence_attachment_ids" });
        try {
            const tx = await withMysqlTransaction(async (conn) => {
                const transactionId = `speech-review-tx-v46-${guard.request_hash.slice(0, 16)}`;
                await conn.execute("INSERT INTO speech_review_transactions_v46 (transaction_id, queue_id, asset_id, reviewer_id, decision, decision_reason, request_hash, idempotency_key, audit_json, committed, public_release_allowed) VALUES (?,?,?,?,?,?,?,?,CAST(? AS JSON),TRUE,FALSE)", [transactionId, body.queue_id, body.asset_id, body.reviewer_id, decision, body.decision_reason, guard.request_hash, body.idempotency_key, JSON.stringify(body)]);
                await conn.execute("UPDATE speech_reviewer_queue_v46 SET queue_status=? WHERE queue_id=? AND asset_id=?", [decision === "return_for_fix" ? "returned_for_fix" : decision === "reject_gate" ? "rejected_gate" : "approved_gate_pending_all_gates", body.queue_id, body.asset_id]);
                await conn.execute("INSERT IGNORE INTO speech_review_sla_events_v46 (event_id, queue_id, asset_id, event_type, actor_id, event_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [`decision-event-v46-${guard.request_hash.slice(0, 16)}`, body.queue_id, body.asset_id, decision, body.reviewer_id, JSON.stringify(body)]);
                return { transaction_id: transactionId };
            });
            res.json({ ok: true, accepted: true, version: "v46", ...tx, request_hash: guard.request_hash, public_release_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v46", error: "review_decision_transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/speech-training/v46/transactional-alignment-import", async (req, res) => {
        const body = req.body ?? {};
        const score = Number(body.alignment_score ?? 0);
        const missing = ["asset_id", "reviewer_id", "transcript_text", "alignment_score", "alignment_json"].filter((key) => body[key] === undefined || body[key] === null || body[key] === "");
        const guard = guardText(body);
        if (missing.length || score < 0.85 || !guard.ok)
            return res.status(400).json({ ok: false, version: "v46", error: "invalid_alignment_import", missing, minimum_score: 0.85, blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => {
                const transactionId = `alignment-tx-v46-${guard.request_hash.slice(0, 16)}`;
                await conn.execute("INSERT INTO speech_alignment_transactions_v46 (transaction_id, asset_id, reviewer_id, alignment_score, transcript_hash, request_hash, alignment_json, committed) VALUES (?,?,?,?,?,?,CAST(? AS JSON),TRUE)", [transactionId, body.asset_id, body.reviewer_id, score, sha(body.transcript_text), guard.request_hash, JSON.stringify(body.alignment_json ?? body)]);
                return { transaction_id: transactionId };
            });
            res.json({ ok: true, accepted: true, version: "v46", ...tx, public_release_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v46", error: "alignment_transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.get("/api/ops/search/music/v46/observability-dashboard", (_req, res) => res.json({ contract: readJson("data/search/music_search_observability_v46.json"), report: readJson("data/search/music_search_observability_report_v46.generated.json") }));
    app.post("/api/internal/search/music/v46/query-log", async (req, res) => {
        const body = req.body ?? {};
        const q = String(body.query_text ?? body.query ?? "").trim();
        const resultCount = Number(body.result_count ?? 0);
        if (!q)
            return res.status(400).json({ ok: false, version: "v46", error: "query_text_required" });
        const guard = guardText(body);
        if (!guard.ok)
            return res.status(400).json({ ok: false, version: "v46", error: "blocked_query_log", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => {
                const logId = `music-query-v46-${guard.request_hash.slice(0, 16)}`;
                await conn.execute("INSERT IGNORE INTO music_search_query_logs_v46 (log_id, query_text, normalized_query, result_count, latency_ms, mode, locale, referrer_path, ip_hash, facets_json, suggestions_json) VALUES (?,?,?,?,?,?,?,?,?,CAST(? AS JSON),CAST(? AS JSON))", [logId, q, q.toLowerCase(), resultCount, Number(body.latency_ms ?? 0), body.mode ?? null, body.locale ?? "zh-Hant", body.referrer_path ?? null, body.ip_hash ?? null, JSON.stringify(body.facets ?? {}), JSON.stringify(body.suggestions ?? [])]);
                if (resultCount === 0) {
                    await conn.execute("INSERT IGNORE INTO music_search_zero_result_events_v46 (event_id, query_text, normalized_query, suggestions_json) VALUES (?,?,?,CAST(? AS JSON))", [`zero-v46-${guard.request_hash.slice(0, 16)}`, q, q.toLowerCase(), JSON.stringify(body.suggestions ?? [])]);
                }
                return { log_id: logId, zero_result_logged: resultCount === 0 };
            });
            res.json({ ok: true, accepted: true, version: "v46", ...tx, request_hash: guard.request_hash });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v46", error: "query_log_transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.get("/api/ops/authority-sources/v46/fetch-governance", (_req, res) => res.json({ contract: readJson("data/integration/authority_source_governance_v46.json"), report: readJson("data/integration/authority_source_retry_merge_report_v46.generated.json") }));
    app.post("/api/internal/authority-sources/v46/retry-or-merge", async (req, res) => {
        const body = req.body ?? {};
        const action = String(body.action ?? "");
        const guard = guardText(body);
        if (!guard.ok || !["retry_fetch", "merge_candidates", "record_robots_tos_review"].includes(action))
            return res.status(400).json({ ok: false, version: "v46", error: "invalid_authority_action", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => {
                if (action === "retry_fetch") {
                    await conn.execute("INSERT IGNORE INTO authority_source_retry_queue_v46 (retry_id, adapter_id, status, attempt, reason, retry_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [`retry-v46-${guard.request_hash.slice(0, 16)}`, body.adapter_id, "queued", Number(body.attempt ?? 0), body.reason ?? "manual_retry", JSON.stringify(body)]);
                }
                else if (action === "merge_candidates") {
                    await conn.execute("INSERT IGNORE INTO authority_source_candidate_merge_requests_v46 (merge_request_id, adapter_id, primary_candidate_id, duplicate_candidate_ids_json, merge_status, reviewer_id, decision_reason, merge_json, public_auto_release) VALUES (?,?,?,?,?,?,?,?,FALSE)", [`merge-v46-${guard.request_hash.slice(0, 16)}`, body.adapter_id, body.primary_candidate_id ?? null, JSON.stringify(body.duplicate_candidate_ids ?? []), "pending_review", body.reviewer_id ?? null, body.reason ?? null, JSON.stringify(body)]);
                }
                else {
                    await conn.execute("INSERT INTO authority_source_fetch_policies_v46 (adapter_id, robots_txt_url, tos_review_status, policy_json) VALUES (?,?,?,CAST(? AS JSON)) ON DUPLICATE KEY UPDATE robots_txt_url=VALUES(robots_txt_url), tos_review_status=VALUES(tos_review_status), policy_json=VALUES(policy_json)", [body.adapter_id, body.robots_txt_url ?? null, body.tos_review_status ?? "recorded", JSON.stringify(body)]);
                }
                return { action };
            });
            res.json({ ok: true, accepted: true, version: "v46", ...tx, public_auto_release: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v46", error: "authority_transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.get("/api/ops/speech-training/v46/experiment-registry", (_req, res) => res.json({ registry: readJson("data/audio/speech_model_experiment_registry_v46.json"), report: readJson("data/audio/speech_model_experiment_report_v46.generated.json") }));
    app.post("/api/internal/speech-training/v46/model-experiment-decision", async (req, res) => {
        const body = req.body ?? {};
        const decision = String(body.decision ?? "");
        const missing = ["experiment_id", "reviewer_id", "decision", "decision_reason"].filter((key) => !body[key]);
        const guard = guardText(body);
        if (missing.length || !allowedModelDecisions.has(decision) || !guard.ok)
            return res.status(400).json({ ok: false, version: "v46", error: "invalid_model_experiment_decision", missing, allowed_decisions: [...allowedModelDecisions], blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => {
                const decisionId = `model-decision-v46-${guard.request_hash.slice(0, 16)}`;
                await conn.execute("INSERT INTO speech_model_release_decisions_v46 (decision_id, experiment_id, reviewer_id, decision, decision_reason, request_hash, public_release_allowed, decision_json) VALUES (?,?,?,?,?,?,FALSE,CAST(? AS JSON))", [decisionId, body.experiment_id, body.reviewer_id, decision, body.decision_reason, guard.request_hash, JSON.stringify(body)]);
                return { decision_id: decisionId };
            });
            res.json({ ok: true, accepted: true, version: "v46", ...tx, public_release_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v46", error: "model_decision_transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.get("/api/ops/site/v46/experience-contract", (_req, res) => res.json({ contract: readJson("data/site/music_site_experience_v46.json"), report: readJson("data/site/music_site_experience_report_v46.generated.json") }));
    app.get("/api/admin/music-speech/v46/review-center", (_req, res) => res.json(readJson("data/admin/music_speech_review_center_v46.json")));
    app.get("/api/ops/vps/v46/preflight-contract", (_req, res) => res.json(readJson("data/ops/vps_preflight_v46.json")));
    app.get("/api/ops/next-upgrade-plan/v47", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v47.json")));
}
