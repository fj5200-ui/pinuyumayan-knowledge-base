import type { Express } from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pool } from "../db/client";

function rootDir() {
  return process.cwd().endsWith("backend") ? path.resolve(process.cwd(), "..") : process.cwd();
}
function readJson(rel: string) {
  return JSON.parse(fs.readFileSync(path.join(rootDir(), rel), "utf8"));
}
function sha(input: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(input ?? {})).digest("hex");
}
const blockedTerms = ["卑南文化遺址", "卑南遺址", "卑南考古遺址", "卑南文化公園", "Peinan Site", "Beinan Site", "Peinan Archaeological Site"];
const allowedReviewActions = new Set(["assign_reviewer", "return_for_fix", "reject_gate", "approve_gate", "import_alignment"]);
const allowedCandidateActions = new Set(["return_for_fix", "reject_candidate", "merge_candidates", "approve_metadata_candidate_only"]);
const allowedModelDecisions = new Set(["block_release", "return_for_fix", "approve_internal_experiment_only"]);
function guardText(body: unknown) {
  const text = JSON.stringify(body ?? {});
  const blocked = blockedTerms.filter((term) => text.includes(term));
  return { ok: blocked.length === 0, blocked, request_hash: sha(body) };
}
async function withMysqlTransaction<T>(work: (conn: any) => Promise<T>) {
  if (!pool) return { db_mode: "contract_only_database_url_missing" as const, committed: false as const, result: null as T | null };
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return { db_mode: "mysql_transaction" as const, committed: true as const, result };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
function nowPlusSeconds(seconds: number) {
  return new Date(Date.now() + seconds * 1000).toISOString().slice(0, 19).replace("T", " ");
}

export function registerTtsSttMusicV47Routes(app: Express) {
  app.get("/api/admin/music-speech/v47/review-center", (_req, res) => res.json(readJson("data/admin/music_speech_review_center_v47.json")));
  app.get("/api/ops/speech-training/v47/review-action-ui", (_req, res) => res.json(readJson("data/audio/speech_review_action_ui_v47.json")));

  app.get("/api/internal/speech-training/v47/hmac-nonce", async (req, res) => {
    const issuedTo = String(req.query.user_id ?? req.headers["x-pinuyumayan-actor"] ?? "internal-user");
    const purpose = String(req.query.purpose ?? "speech_review_write");
    const nonceId = `nonce-v47-${crypto.randomUUID()}`;
    const nonce = crypto.randomBytes(24).toString("hex");
    const nonceHash = sha({ nonce });
    try {
      const tx = await withMysqlTransaction(async (conn) => {
        await conn.execute("INSERT INTO speech_review_hmac_nonces_v47 (nonce_id, nonce_hash, issued_to, purpose, expires_at) VALUES (?,?,?,?,?)", [nonceId, nonceHash, issuedTo, purpose, nowPlusSeconds(300)]);
        return { nonce_id: nonceId };
      });
      res.json({ ok: true, version: "v47", nonce_id: nonceId, nonce, ttl_seconds: 300, ...tx });
    } catch (error) {
      res.status(500).json({ ok: false, version: "v47", error: "nonce_issue_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/internal/speech-training/v47/upload-evidence-record", async (req, res) => {
    const body = req.body ?? {};
    const missing = ["queue_id", "asset_id", "evidence_type", "storage_uri", "sha256_hash", "uploaded_by", "idempotency_key"].filter((key) => !body[key]);
    const guard = guardText(body);
    if (missing.length || !guard.ok) return res.status(400).json({ ok: false, version: "v47", error: "invalid_evidence_record", missing, blocked_terms: guard.blocked });
    try {
      const tx = await withMysqlTransaction(async (conn) => {
        const attachmentId = `evidence-v47-${guard.request_hash.slice(0, 16)}`;
        await conn.execute("INSERT IGNORE INTO speech_review_evidence_attachments_v46 (attachment_id, queue_id, asset_id, evidence_type, storage_uri, sha256_hash, uploaded_by, scan_status, attachment_json) VALUES (?,?,?,?,?,?,?,'pending_scan',CAST(? AS JSON))", [attachmentId, body.queue_id, body.asset_id, body.evidence_type, body.storage_uri, body.sha256_hash, body.uploaded_by, JSON.stringify(body)]);
        await conn.execute("INSERT IGNORE INTO speech_review_action_audit_v47 (action_id, queue_id, asset_id, action_type, actor_id, request_hash, idempotency_key, action_json, committed, public_release_allowed) VALUES (?,?,?,?,?,?,?,?,TRUE,FALSE)", [`audit-v47-${guard.request_hash.slice(0, 16)}`, body.queue_id, body.asset_id, "upload_evidence", body.uploaded_by, guard.request_hash, body.idempotency_key, JSON.stringify(body)]);
        return { attachment_id: attachmentId };
      });
      res.json({ ok: true, accepted: true, version: "v47", ...tx, public_release_allowed: false });
    } catch (error) {
      res.status(500).json({ ok: false, version: "v47", error: "evidence_transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/internal/speech-training/v47/review-action", async (req, res) => {
    const body = req.body ?? {};
    const action = String(body.action_type ?? body.action ?? "");
    const missing = ["queue_id", "asset_id", "actor_id", "idempotency_key"].filter((key) => !body[key]);
    const guard = guardText(body);
    if (missing.length || !allowedReviewActions.has(action) || !guard.ok) return res.status(400).json({ ok: false, version: "v47", error: "invalid_review_action", missing, allowed_actions: [...allowedReviewActions], blocked_terms: guard.blocked });
    if (action === "approve_gate" && !body.evidence_attachment_ids?.length) return res.status(400).json({ ok: false, version: "v47", error: "approve_requires_evidence_attachment_ids", rollback_expected: true });
    try {
      const tx = await withMysqlTransaction(async (conn) => {
        const actionId = `review-action-v47-${guard.request_hash.slice(0, 16)}`;
        let queueStatus = "assigned";
        if (action === "return_for_fix") queueStatus = "returned_for_fix";
        if (action === "reject_gate") queueStatus = "rejected_gate";
        if (action === "approve_gate") queueStatus = "approved_gate_pending_all_gates";
        if (action === "assign_reviewer") {
          await conn.execute("UPDATE speech_reviewer_queue_v46 SET assigned_reviewer_id=?, assigned_by=?, assigned_at=NOW(), due_at=DATE_ADD(NOW(), INTERVAL 72 HOUR), queue_status='assigned' WHERE queue_id=? AND asset_id=?", [body.reviewer_id ?? body.actor_id, body.actor_id, body.queue_id, body.asset_id]);
        } else {
          await conn.execute("UPDATE speech_reviewer_queue_v46 SET queue_status=? WHERE queue_id=? AND asset_id=?", [queueStatus, body.queue_id, body.asset_id]);
        }
        await conn.execute("INSERT IGNORE INTO speech_review_action_audit_v47 (action_id, queue_id, asset_id, action_type, actor_id, request_hash, idempotency_key, action_json, committed, public_release_allowed) VALUES (?,?,?,?,?,?,?,?,TRUE,FALSE)", [actionId, body.queue_id, body.asset_id, action, body.actor_id, guard.request_hash, body.idempotency_key, JSON.stringify(body)]);
        if (action === "import_alignment") {
          const score = Number(body.alignment_score ?? 0);
          if (score < 0.85) throw new Error("alignment_score_below_0_85");
          await conn.execute("INSERT IGNORE INTO speech_alignment_transactions_v46 (transaction_id, asset_id, reviewer_id, alignment_score, transcript_hash, request_hash, alignment_json, committed) VALUES (?,?,?,?,?,?,CAST(? AS JSON),TRUE)", [`alignment-v47-${guard.request_hash.slice(0, 16)}`, body.asset_id, body.actor_id, score, sha(body.transcript_text ?? ""), guard.request_hash, JSON.stringify(body.alignment_json ?? body)]);
        }
        return { action_id: actionId, queue_status: queueStatus };
      });
      res.json({ ok: true, accepted: true, version: "v47", ...tx, request_hash: guard.request_hash, public_release_allowed: false });
    } catch (error) {
      res.status(500).json({ ok: false, version: "v47", error: "review_action_transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/ops/database/v47/transaction-tests", (_req, res) => res.json(readJson("data/database/mysql_transaction_integration_tests_v47.json")));
  app.post("/api/internal/database/v47/run-transaction-test", async (req, res) => {
    const body = req.body ?? {};
    const caseId = String(body.case_id ?? "manual-v47-test");
    const guard = guardText(body);
    if (!guard.ok) return res.status(400).json({ ok: false, version: "v47", error: "blocked_test_payload", blocked_terms: guard.blocked });
    try {
      const tx = await withMysqlTransaction(async (conn) => {
        const runId = `tx-test-v47-${guard.request_hash.slice(0, 16)}`;
        await conn.execute("INSERT IGNORE INTO mysql_transaction_integration_test_runs_v47 (run_id, case_id, status, expected_result, actual_result, run_json) VALUES (?,?,?,?,?,CAST(? AS JSON))", [runId, caseId, "recorded", body.expected_result ?? null, "manual run recorded", JSON.stringify(body)]);
        return { run_id: runId };
      });
      res.json({ ok: true, version: "v47", ...tx });
    } catch (error) {
      res.status(500).json({ ok: false, version: "v47", error: "transaction_test_record_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/ops/search/music/v47/observability-dashboard", (_req, res) => res.json(readJson("data/search/music_search_production_observability_v47.json")));
  app.post("/api/internal/search/music/v47/query-log", async (req, res) => {
    const body = req.body ?? {};
    const q = String(body.query_text ?? body.query ?? "").trim();
    if (!q) return res.status(400).json({ ok: false, version: "v47", error: "query_text_required" });
    const guard = guardText(body);
    if (!guard.ok) return res.status(400).json({ ok: false, version: "v47", error: "blocked_query_log", blocked_terms: guard.blocked });
    try {
      const tx = await withMysqlTransaction(async (conn) => {
        const logId = `music-query-v47-${guard.request_hash.slice(0, 16)}`;
        await conn.execute("INSERT IGNORE INTO music_search_query_logs_v47 (log_id, query_text, normalized_query, result_count, latency_ms, mode, locale, referrer_path, ip_hash, facet_counts_json, suggestions_json, source_route) VALUES (?,?,?,?,?,?,?,?,?,CAST(? AS JSON),CAST(? AS JSON),?)", [logId, q, q.toLowerCase(), Number(body.result_count ?? 0), Number(body.latency_ms ?? 0), body.mode ?? null, body.locale ?? "zh-Hant", body.referrer_path ?? null, body.ip_hash ?? null, JSON.stringify(body.facet_counts ?? body.facets ?? {}), JSON.stringify(body.suggestions ?? []), body.source_route ?? "/api/public/search/music/v43"]);
        return { log_id: logId };
      });
      res.json({ ok: true, accepted: true, version: "v47", ...tx });
    } catch (error) {
      res.status(500).json({ ok: false, version: "v47", error: "query_log_transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/ops/authority-sources/v47/fetch-adapters", (_req, res) => res.json(readJson("data/integration/authority_source_fetch_adapters_v47.json")));
  app.post("/api/internal/authority-sources/v47/live-fetch-run", async (req, res) => {
    const body = req.body ?? {};
    const adapterId = String(body.adapter_id ?? "");
    const guard = guardText(body);
    if (!adapterId || !guard.ok) return res.status(400).json({ ok: false, version: "v47", error: "invalid_authority_fetch_run", blocked_terms: guard.blocked });
    const liveEnabled = process.env.AUTHORITY_FETCH_LIVE === "1";
    try {
      const tx = await withMysqlTransaction(async (conn) => {
        const runId = `auth-fetch-v47-${guard.request_hash.slice(0, 16)}`;
        const candidates = Array.isArray(body.candidates) ? body.candidates.slice(0, 20) : [];
        await conn.execute("INSERT IGNORE INTO authority_source_fetch_runs_v47 (fetch_run_id, adapter_id, fetch_mode, robots_tos_status, http_status, etag, last_modified, candidate_count, run_json) VALUES (?,?,?,?,?,?,?,?,CAST(? AS JSON))", [runId, adapterId, "metadata_only_candidate_snapshot", body.robots_tos_status ?? "needs_human_record", body.http_status ?? null, body.etag ?? null, body.last_modified ?? null, candidates.length, JSON.stringify({ ...body, live_enabled: liveEnabled })]);
        for (const [idx, candidate] of candidates.entries()) {
          await conn.execute("INSERT IGNORE INTO authority_source_candidate_snapshots_v47 (candidate_id, fetch_run_id, adapter_id, source_title, source_url, summary_excerpt, rights_statement, review_status, public_auto_release, candidate_json) VALUES (?,?,?,?,?,?,?,'pending_metadata_review',FALSE,CAST(? AS JSON))", [`auth-candidate-v47-${guard.request_hash.slice(0, 10)}-${idx}`, runId, adapterId, candidate.source_title ?? null, candidate.source_url ?? null, candidate.summary_excerpt ?? null, candidate.rights_statement ?? null, JSON.stringify(candidate)]);
        }
        return { fetch_run_id: runId, live_enabled: liveEnabled, candidate_count: candidates.length };
      });
      res.json({ ok: true, accepted: true, version: "v47", ...tx, metadata_only: true, public_auto_release: false });
    } catch (error) {
      res.status(500).json({ ok: false, version: "v47", error: "authority_fetch_transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/internal/authority-sources/v47/candidate-review", async (req, res) => {
    const body = req.body ?? {};
    const action = String(body.action ?? "");
    const guard = guardText(body);
    if (!body.candidate_id || !allowedCandidateActions.has(action) || !guard.ok) return res.status(400).json({ ok: false, version: "v47", error: "invalid_candidate_review", allowed_actions: [...allowedCandidateActions], blocked_terms: guard.blocked });
    try {
      const tx = await withMysqlTransaction(async (conn) => {
        await conn.execute("UPDATE authority_source_candidate_snapshots_v47 SET review_status=? WHERE candidate_id=?", [action, body.candidate_id]);
        return { candidate_id: body.candidate_id, review_status: action };
      });
      res.json({ ok: true, accepted: true, version: "v47", ...tx, public_auto_release: false });
    } catch (error) {
      res.status(500).json({ ok: false, version: "v47", error: "candidate_review_transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/ops/speech-training/v47/governance-report", (_req, res) => res.json(readJson("data/audio/speech_model_governance_reports_v47.json")));
  app.post("/api/internal/speech-training/v47/model-governance-decision", async (req, res) => {
    const body = req.body ?? {};
    const decision = String(body.decision ?? "");
    const missing = ["experiment_id", "reviewer_id", "decision", "decision_reason"].filter((key) => !body[key]);
    const guard = guardText(body);
    if (missing.length || !allowedModelDecisions.has(decision) || !guard.ok) return res.status(400).json({ ok: false, version: "v47", error: "invalid_model_governance_decision", missing, allowed_decisions: [...allowedModelDecisions], blocked_terms: guard.blocked });
    try {
      const tx = await withMysqlTransaction(async (conn) => {
        const reportId = `model-gov-v47-${guard.request_hash.slice(0, 16)}`;
        await conn.execute("INSERT IGNORE INTO speech_model_governance_reports_v47 (report_id, experiment_id, report_type, public_release_allowed, report_json) VALUES (?,?,?,FALSE,CAST(? AS JSON))", [reportId, body.experiment_id, decision, JSON.stringify(body)]);
        await conn.execute("INSERT IGNORE INTO speech_model_release_decisions_v46 (decision_id, experiment_id, reviewer_id, decision, decision_reason, request_hash, public_release_allowed, decision_json) VALUES (?,?,?,?,?,?,FALSE,CAST(? AS JSON))", [`model-decision-v47-${guard.request_hash.slice(0, 16)}`, body.experiment_id, body.reviewer_id, decision, body.decision_reason, guard.request_hash, JSON.stringify(body)]);
        return { report_id: reportId };
      });
      res.json({ ok: true, accepted: true, version: "v47", ...tx, public_release_allowed: false });
    } catch (error) {
      res.status(500).json({ ok: false, version: "v47", error: "model_governance_transaction_failed_rolled_back", message: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/ops/site/v47/polish-contract", (_req, res) => res.json(readJson("data/site/music_site_polish_v47.json")));
  app.get("/api/ops/vps/v47/preflight-contract", (_req, res) => res.json(readJson("data/ops/vps_preflight_v47.json")));
  app.get("/api/ops/next-upgrade-plan/v48", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v48.json")));
}
