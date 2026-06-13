import type { Express } from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

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
const allowedReviewDecisions = new Set(["approve_gate", "reject_gate", "return_for_fix"]);

export function registerTtsSttMusicV45Routes(app: Express) {
  app.get("/api/ops/speech-training/v45/review-workflow", (_req, res) => res.json(readJson("data/audio/speech_review_workflow_v45.json")));
  app.get("/api/ops/speech-training/v45/alignment-import-contract", (_req, res) => res.json(readJson("data/audio/speech_alignment_import_contract_v45.json")));
  app.post("/api/internal/speech-training/v45/review-decision", (req, res) => {
    const body = req.body ?? {};
    const decision = String(body.decision ?? "");
    const required = ["asset_id", "reviewer_id", "decision", "gate_name", "decision_reason"];
    const missing = required.filter((key) => !body[key]);
    const text = JSON.stringify(body);
    const blocked = blockedTerms.filter((term) => text.includes(term));
    if (missing.length || !allowedReviewDecisions.has(decision) || blocked.length) {
      return res.status(400).json({ ok: false, accepted: false, version: "v45", error: "invalid_review_decision", missing, blocked_terms: blocked, allowed_decisions: [...allowedReviewDecisions] });
    }
    const approveNeedsEvidence = decision === "approve_gate" && !body.evidence_url;
    if (approveNeedsEvidence) return res.status(400).json({ ok: false, accepted: false, version: "v45", error: "approve_requires_evidence_url" });
    res.json({ ok: true, accepted: true, version: "v45", decision_id: `speech-decision-v45-${sha(body).slice(0, 16)}`, audit_id: `audit-v45-${sha({ audit: body }).slice(0, 16)}`, public_release_allowed: false, db_tables: ["speech_review_decisions_v45", "speech_review_audit_log_v45"], report_hash: sha(body) });
  });
  app.post("/api/internal/speech-training/v45/alignment-import", (req, res) => {
    const body = req.body ?? {};
    const required = ["asset_id", "transcript_text", "aligner_version", "reviewer_id", "alignment_score"];
    const missing = required.filter((key) => body[key] === undefined || body[key] === null || body[key] === "");
    const score = Number(body.alignment_score ?? 0);
    const accepted = missing.length === 0 && score >= 0.85;
    res.status(accepted ? 200 : 400).json({ ok: accepted, accepted, version: "v45", import_id: `align-import-v45-${sha(body).slice(0, 16)}`, minimum_confidence: 0.85, reject_reasons: [...missing.map((m) => `missing_${m}`), ...(score < 0.85 ? ["alignment_score_below_0_85"] : [])], public_release_allowed: false, db_table: "speech_alignment_imports_v45", report_hash: sha(body) });
  });

  app.get("/api/ops/search/music/v45/quality-contract", (_req, res) => res.json({ ...readJson("data/search/music_search_quality_v45.json"), synonyms: readJson("data/search/music_query_synonyms_v45.json"), report: readJson("data/search/music_search_quality_report_v45.generated.json") }));
  app.get("/api/ops/authority-sources/v45/fetch-worker-contract", (_req, res) => res.json({ ...readJson("data/integration/authority_source_worker_v45.json"), dry_run: readJson("data/integration/authority_source_fetch_dry_run_v45.generated.json") }));
  app.post("/api/internal/authority-sources/v45/fetch-run-report", (req, res) => {
    const text = JSON.stringify(req.body ?? {});
    const blocked = blockedTerms.filter((term) => text.includes(term));
    res.status(blocked.length ? 400 : 200).json({ ok: blocked.length === 0, accepted: blocked.length === 0, version: "v45", run_id: `auth-run-v45-${sha(req.body).slice(0, 16)}`, blocked_terms: blocked, public_auto_release: false, db_tables: ["authority_source_worker_runs_v45", "authority_source_candidates_v45", "music_candidate_reviews_v45"], report_hash: sha(req.body) });
  });

  app.get("/api/ops/speech-training/v45/governance-report", (_req, res) => res.json({ contract: readJson("data/audio/tts_stt_experiment_governance_v45.json"), alignment_import: readJson("data/audio/speech_alignment_import_contract_v45.json"), report: readJson("data/audio/tts_stt_governance_report_v45.generated.json") }));
  app.get("/api/public/music/v45/seo/:id", (req, res) => {
    const id = req.params.id;
    const docs = readJson("data/search/music_search_documents_v44.seed.json").documents ?? [];
    const doc = docs.find((item: any) => item.id === id);
    if (!doc) return res.status(404).json({ ok: false, error: "music_seo_metadata_not_found", id });
    const jsonLd = { "@context": "https://schema.org", "@type": "MusicRecording", name: doc.title, description: doc.summary ?? doc.body, inLanguage: "zh-Hant", isAccessibleForFree: true, license: doc.rights_status ?? "metadata_only_review_required", publisher: { "@type": "Organization", name: "Pinuyumayan" } };
    res.json({ ok: true, version: "v45", id, metadata_only: true, no_lyrics: true, no_audio_download: true, json_ld: jsonLd, og: { title: `Pinuyumayan Music Metadata｜${doc.title}`, image_endpoint: `/music/${encodeURIComponent(id)}/opengraph-image` } });
  });
  app.get("/api/ops/site/v45/sitemap-contract", (_req, res) => res.json({ contract: readJson("data/site/music_seo_og_contract_v45.json"), report: readJson("data/site/music_seo_og_report_v45.generated.json") }));
  app.get("/api/ops/vps/v45/preflight-contract", (_req, res) => res.json(readJson("data/ops/vps_preflight_v45.json")));
  app.get("/api/admin/music-speech/v45/review-center", (_req, res) => res.json(readJson("data/admin/music_speech_review_center_v45.json")));
  app.get("/api/ops/next-upgrade-plan/v46", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v46.json")));
}
