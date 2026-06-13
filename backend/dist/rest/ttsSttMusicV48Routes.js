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
const allowedBulkActions = new Set(["assign_reviewer", "return_for_fix", "reject_gate"]);
const allowedMergeActions = new Set(["manual_merge_metadata_only", "reject_duplicate", "keep_separate_pending_rights_review", "return_for_source_citation"]);
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
export function registerTtsSttMusicV48Routes(app) {
    app.get("/api/admin/music-speech/v48/review-center", (_req, res) => res.json(readJson("data/admin/music_speech_review_center_v48.json")));
    app.get("/api/ops/vps/v48/db-validation-report", (_req, res) => res.json(readJson("data/database/vps_db_validation_report_v48.json")));
    app.post("/api/internal/vps/v48/run-db-validation", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!guard.ok)
            return res.status(400).json({ ok: false, version: "v48", error: "blocked_validation_payload", blocked_terms: guard.blocked });
        try {
            const report = readJson("data/database/vps_db_validation_report_v48.json");
            const tx = await withMysqlTransaction(async (conn) => {
                const reportId = `vps-db-validation-v48-${guard.request_hash.slice(0, 16)}`;
                await conn.execute("INSERT IGNORE INTO vps_db_validation_reports_v48 (report_id, run_mode, status, checks_total, checks_passed, checks_failed, migration_checksum, seed_checksum, report_json) VALUES (?,?,?,?,?,?,?,?,CAST(? AS JSON))", [reportId, body.run_mode ?? "vps_live", "recorded", report.checks?.length ?? 0, Number(body.checks_passed ?? 0), Number(body.checks_failed ?? 0), body.migration_checksum ?? null, body.seed_checksum ?? null, JSON.stringify({ ...report, request: body })]);
                for (const [idx, check] of (report.checks ?? []).entries()) {
                    await conn.execute("INSERT IGNORE INTO vps_db_validation_check_results_v48 (result_id, report_id, check_id, status, expected_result, actual_result, check_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [`vps-db-validation-v48-${guard.request_hash.slice(0, 8)}-${idx}`, reportId, check.check_id, body.check_status ?? check.status, check.expected ?? null, body.actual_result ?? null, JSON.stringify(check)]);
                }
                return { report_id: reportId, checks_total: report.checks?.length ?? 0 };
            });
            res.json({ ok: true, accepted: true, version: "v48", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v48", error: "db_validation_transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.get("/api/admin/music-speech/v48/workbench", (_req, res) => res.json(readJson("data/admin/speech_review_workbench_v48.json")));
    app.post("/api/internal/speech-training/v48/bulk-review-action", async (req, res) => {
        const body = req.body ?? {};
        const action = String(body.action_type ?? "");
        const selected = Array.isArray(body.selected_queue_ids) ? body.selected_queue_ids.slice(0, 80) : [];
        const guard = guardText(body);
        if (!body.actor_id || !body.idempotency_key || !allowedBulkActions.has(action) || !selected.length || !guard.ok)
            return res.status(400).json({ ok: false, version: "v48", error: "invalid_bulk_review_action", allowed_actions: [...allowedBulkActions], blocked_terms: guard.blocked });
        if (action === "reject_gate" && !body.decision_reason)
            return res.status(400).json({ ok: false, version: "v48", error: "reject_gate_requires_decision_reason" });
        try {
            const tx = await withMysqlTransaction(async (conn) => {
                const bulkActionId = `bulk-review-v48-${guard.request_hash.slice(0, 16)}`;
                await conn.execute("INSERT IGNORE INTO speech_review_bulk_actions_v48 (bulk_action_id, action_type, actor_id, selected_count, success_count, failed_count, request_hash, idempotency_key, action_json, public_release_allowed) VALUES (?,?,?,?,?,?,?,?,CAST(? AS JSON),FALSE)", [bulkActionId, action, body.actor_id, selected.length, 0, 0, guard.request_hash, body.idempotency_key, JSON.stringify(body)]);
                for (const queueId of selected) {
                    await conn.execute("INSERT IGNORE INTO speech_review_history_events_v48 (event_id, queue_id, asset_id, actor_id, event_type, request_hash, event_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [`history-v48-${sha({ queueId, action, key: body.idempotency_key }).slice(0, 16)}`, String(queueId), String(body.asset_id ?? "batch"), body.actor_id, action, guard.request_hash, JSON.stringify({ queue_id: queueId, ...body })]);
                }
                return { bulk_action_id: bulkActionId, selected_count: selected.length };
            });
            res.json({ ok: true, accepted: true, version: "v48", ...tx, public_release_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v48", error: "bulk_review_transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/speech-training/v48/review-history-event", async (req, res) => {
        const body = req.body ?? {};
        const missing = ["queue_id", "asset_id", "actor_id", "event_type"].filter((key) => !body[key]);
        const guard = guardText(body);
        if (missing.length || !guard.ok)
            return res.status(400).json({ ok: false, version: "v48", error: "invalid_history_event", missing, blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => {
                const eventId = `history-v48-${guard.request_hash.slice(0, 16)}`;
                await conn.execute("INSERT IGNORE INTO speech_review_history_events_v48 (event_id, queue_id, asset_id, actor_id, event_type, request_hash, event_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [eventId, body.queue_id, body.asset_id, body.actor_id, body.event_type, guard.request_hash, JSON.stringify(body)]);
                return { event_id: eventId };
            });
            res.json({ ok: true, accepted: true, version: "v48", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v48", error: "history_event_transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.get("/api/ops/search/music/v48/analytics-dashboard", (_req, res) => res.json(readJson("data/search/music_search_analytics_dashboard_v48.json")));
    app.post("/api/internal/search/music/v48/aggregate-query-logs", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!guard.ok)
            return res.status(400).json({ ok: false, version: "v48", error: "blocked_analytics_payload", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => {
                const metricDate = body.metric_date ?? new Date().toISOString().slice(0, 10);
                await conn.execute("INSERT INTO music_search_daily_metrics_v48 (metric_date, query_count, zero_result_count, zero_result_rate, p95_latency_ms, p99_latency_ms, top_queries_json, facet_clicks_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON),CAST(? AS JSON)) ON DUPLICATE KEY UPDATE query_count=VALUES(query_count), zero_result_count=VALUES(zero_result_count), zero_result_rate=VALUES(zero_result_rate), p95_latency_ms=VALUES(p95_latency_ms), p99_latency_ms=VALUES(p99_latency_ms), top_queries_json=VALUES(top_queries_json), facet_clicks_json=VALUES(facet_clicks_json)", [metricDate, Number(body.query_count ?? 0), Number(body.zero_result_count ?? 0), Number(body.zero_result_rate ?? 0), Number(body.p95_latency_ms ?? 0), Number(body.p99_latency_ms ?? 0), JSON.stringify(body.top_queries ?? []), JSON.stringify(body.facet_clicks ?? [])]);
                return { metric_date: metricDate };
            });
            res.json({ ok: true, accepted: true, version: "v48", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v48", error: "aggregate_query_logs_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/search/music/v48/alert-notification", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.rule_id || !guard.ok)
            return res.status(400).json({ ok: false, version: "v48", error: "invalid_alert_notification", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => {
                const notificationId = `search-alert-v48-${guard.request_hash.slice(0, 16)}`;
                await conn.execute("INSERT IGNORE INTO music_search_alert_notifications_v48 (notification_id, rule_id, severity, metric_value, notification_status, notification_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [notificationId, body.rule_id, body.severity ?? "warning", body.metric_value ?? null, body.notification_status ?? "pending", JSON.stringify(body)]);
                return { notification_id: notificationId };
            });
            res.json({ ok: true, accepted: true, version: "v48", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v48", error: "alert_notification_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.get("/api/ops/authority-sources/v48/candidate-merge-dashboard", (_req, res) => res.json(readJson("data/integration/authority_candidate_merge_v48.json")));
    app.post("/api/internal/authority-sources/v48/merge-decision", async (req, res) => {
        const body = req.body ?? {};
        const action = String(body.decision ?? "");
        const guard = guardText(body);
        if (!body.merge_group_id || !body.reviewer_id || !allowedMergeActions.has(action) || !guard.ok)
            return res.status(400).json({ ok: false, version: "v48", error: "invalid_merge_decision", allowed_decisions: [...allowedMergeActions], blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => {
                const decisionId = `authority-merge-decision-v48-${guard.request_hash.slice(0, 16)}`;
                await conn.execute("INSERT IGNORE INTO authority_candidate_merge_decisions_v48 (decision_id, merge_group_id, reviewer_id, decision, request_hash, decision_json, public_auto_release) VALUES (?,?,?,?,?,CAST(? AS JSON),FALSE)", [decisionId, body.merge_group_id, body.reviewer_id, action, guard.request_hash, JSON.stringify(body)]);
                return { decision_id: decisionId };
            });
            res.json({ ok: true, accepted: true, version: "v48", ...tx, metadata_only: true, public_auto_release: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v48", error: "authority_merge_decision_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.get("/api/ops/speech-training/v48/model-visualization", (_req, res) => res.json(readJson("data/audio/speech_model_visualization_v48.json")));
    app.post("/api/internal/speech-training/v48/export-governance-artifact", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.artifact_format || !guard.ok)
            return res.status(400).json({ ok: false, version: "v48", error: "invalid_governance_export", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => {
                const artifactId = `model-export-v48-${guard.request_hash.slice(0, 16)}`;
                await conn.execute("INSERT IGNORE INTO speech_model_export_artifacts_v48 (artifact_id, experiment_id, artifact_format, storage_uri, export_status, artifact_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [artifactId, body.experiment_id ?? null, body.artifact_format, body.storage_uri ?? null, "contract_ready", JSON.stringify(body)]);
                return { artifact_id: artifactId };
            });
            res.json({ ok: true, accepted: true, version: "v48", ...tx, public_release_allowed: false });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v48", error: "governance_export_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.get("/api/ops/site/v48/visual-completion", (_req, res) => res.json(readJson("data/site/main_site_visual_completion_v48.json")));
    app.post("/api/internal/site/v48/visual-audit-record", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.route_path || !guard.ok)
            return res.status(400).json({ ok: false, version: "v48", error: "invalid_visual_audit", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => {
                const auditId = `site-audit-v48-${guard.request_hash.slice(0, 16)}`;
                await conn.execute("INSERT IGNORE INTO site_visual_audit_results_v48 (audit_id, route_path, day_mode_status, night_mode_status, og_status, metadata_guard_status, audit_json) VALUES (?,?,?,?,?,?,CAST(? AS JSON))", [auditId, body.route_path, body.day_mode_status ?? "not_run", body.night_mode_status ?? "not_run", body.og_status ?? "not_run", body.metadata_guard_status ?? "not_run", JSON.stringify(body)]);
                return { audit_id: auditId };
            });
            res.json({ ok: true, accepted: true, version: "v48", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v48", error: "visual_audit_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.post("/api/internal/site/v48/sitemap-ping-record", async (req, res) => {
        const body = req.body ?? {};
        const guard = guardText(body);
        if (!body.sitemap_url || !body.ping_target || !guard.ok)
            return res.status(400).json({ ok: false, version: "v48", error: "invalid_sitemap_ping", blocked_terms: guard.blocked });
        try {
            const tx = await withMysqlTransaction(async (conn) => {
                const pingId = `sitemap-ping-v48-${guard.request_hash.slice(0, 16)}`;
                await conn.execute("INSERT IGNORE INTO site_sitemap_ping_runs_v48 (ping_id, sitemap_url, ping_target, ping_status, response_status, ping_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [pingId, body.sitemap_url, body.ping_target, body.ping_status ?? "not_run", body.response_status ?? null, JSON.stringify(body)]);
                return { ping_id: pingId };
            });
            res.json({ ok: true, accepted: true, version: "v48", ...tx });
        }
        catch (error) {
            res.status(500).json({ ok: false, version: "v48", error: "sitemap_ping_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
        }
    });
    app.get("/api/ops/vps/v48/preflight-contract", (_req, res) => res.json(readJson("data/ops/vps_preflight_v48.json")));
    app.get("/api/ops/next-upgrade-plan/v49", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v49.json")));
}
