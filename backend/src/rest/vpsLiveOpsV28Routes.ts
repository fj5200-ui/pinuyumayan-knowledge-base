import type { Express } from 'express';
import { getDataModeStatusV28 } from '../lib/productionDbFallbackV28';

const previewAcceptance = {
  version: 'v28-preview-generated',
  totalEntries: 80,
  requiredMinEntries: 1000,
  audioCoverageRatio: 1,
  sourcePhonCoverageRatio: 1,
  status: 'failed',
  reason: 'embedded preview subset is below required 1000; run full corpus import on VPS staging'
};

export function registerVpsLiveOpsV28Routes(app: Express) {
  app.get('/api/ops/data-mode/v28/status', (_req, res) => {
    res.json({ ok: true, data: getDataModeStatusV28() });
  });

  app.get('/api/ops/db-fallback/v28/events', (_req, res) => {
    res.json({ ok: true, data: { events: [], note: 'DB-backed implementation should read production_fallback_events_v28.' } });
  });

  app.get('/api/admin/corpus/v28/acceptance-latest', (_req, res) => {
    res.json({ ok: true, data: previewAcceptance });
  });

  app.post('/api/internal/corpus/v28/acceptance-report', (req, res) => {
    const body = req.body ?? {};
    const totalEntries = Number(body.totalEntries ?? body.total_entries ?? 0);
    const status = totalEntries >= 1000 ? 'passed_or_manual_review' : 'failed';
    res.json({ ok: true, data: { accepted: true, status, totalEntries, shouldPersistTo: 'full_corpus_acceptance_metrics_v27' } });
  });

  app.get('/api/ops/search/v28/index-status', (_req, res) => {
    res.json({ ok: true, data: { adapter: 'mysql_fulltext', targetTable: 'search_index_documents_v27', status: 'ready_for_build', forbiddenRelationBlocklistActive: true } });
  });

  app.post('/api/internal/search/v28/rebuild', (req, res) => {
    const dryRun = req.query.dryRun === '1' || req.body?.dryRun === true;
    res.json({ ok: true, data: { queued: !dryRun, dryRun, adapter: 'mysql_fulltext', jobTable: 'search_index_build_runs_v28' } });
  });

  app.get('/api/admin/articles/v28/live-queue', (_req, res) => {
    res.json({ ok: true, data: { items: [], note: 'Wire this to frontend_ai_draft_submissions_v19 + article_review_transactions_v26 in production.' } });
  });

  app.get('/api/ops/security/v28/hmac-failures', (_req, res) => {
    res.json({ ok: true, data: { failures: [], sourceTables: ['hmac_failure_events_v26', 'security_audit_events_v15'] } });
  });

  app.get('/api/ops/vps-db/v28/restore-drills', (_req, res) => {
    res.json({ ok: true, data: { drills: [], reportTable: 'vps_restore_drill_reports_v28' } });
  });

  app.post('/api/internal/vps-db/v28/restore-drill-report', (req, res) => {
    res.json({ ok: true, data: { accepted: true, report: req.body ?? {}, shouldPersistTo: 'vps_restore_drill_reports_v28' } });
  });

  app.get('/api/ops/source-candidates/v28/review-items', (_req, res) => {
    res.json({ ok: true, data: { items: [], note: 'candidate-only queue; do not auto-publish external source candidates' } });
  });

  app.get('/api/ops/next-upgrade-plan/v29', (_req, res) => {
    res.json({ ok: true, data: { version: 'v29', title: 'Live VPS Execution + Admin Wiring', source: 'data/development/next_upgrade_plan_v29.json' } });
  });
}
