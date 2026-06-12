import type { Express, Request, Response } from 'express';
import { execute, queryRows } from '../lib/dbQuery';
import { getDataModeStatusV28 } from '../lib/productionDbFallbackV28';

function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

async function safeRows<T = any>(sql: string, params: any[] = [], fallback: T[] = []): Promise<T[]> {
  if (!isDbConfigured()) return fallback;
  try { return await queryRows<T & Record<string, any>>(sql, params); }
  catch { return fallback; }
}

function runKey(prefix: string) {
  return `${prefix}-${new Date().toISOString().replace(/[:.]/g, '-')}`;
}

export function registerVpsActualOpsV29Routes(app: Express) {
  app.get('/api/ops/vps/v29/readiness', async (_req: Request, res: Response) => {
    const dataMode = getDataModeStatusV28();
    const rows = await safeRows('SELECT DATABASE() AS db_name', [], []);
    res.json({
      ok: true,
      data: {
        version: 'v29',
        databaseConfigured: isDbConfigured(),
        databaseReachable: rows.length > 0,
        databaseName: rows[0]?.db_name ?? null,
        dataMode,
        mustRunOnVpsForFullCorpus: true,
        nextCommand: './deploy/vps-run-full-corpus-v29.sh --min-entries 1000 --database "$DATABASE_URL" --import-sql'
      }
    });
  });

  app.post('/api/internal/vps/v29/full-corpus-run/start', async (req: Request, res: Response) => {
    const key = req.body?.runKey ?? runKey('full-corpus-v29');
    const minEntries = Number(req.body?.minEntries ?? 1000);
    if (isDbConfigured()) {
      await execute(
        `INSERT INTO full_corpus_execution_runs_v29 (run_key, environment, database_target, min_entries, status, operator, started_at)
         VALUES (?, ?, ?, ?, 'running', ?, NOW())
         ON DUPLICATE KEY UPDATE status='running', started_at=NOW()`,
        [key, req.body?.environment ?? 'staging', req.body?.databaseTarget ?? 'vps-db', minEntries, req.body?.operator ?? null]
      );
    }
    res.json({ ok: true, data: { runKey: key, status: 'running', minEntries, command: './deploy/vps-run-full-corpus-v29.sh --min-entries 1000 --database "$DATABASE_URL" --import-sql' } });
  });

  app.post('/api/internal/vps/v29/full-corpus-run/report', async (req: Request, res: Response) => {
    const body = req.body ?? {};
    const key = body.runKey ?? runKey('full-corpus-report-v29');
    const totalEntries = Number(body.total_entries ?? body.totalEntries ?? 0);
    const status = body.status ?? (totalEntries >= 1000 && Number(body.forbidden_relation_hits ?? body.forbiddenRelationHits ?? 0) === 0 ? 'passed' : 'failed');
    if (isDbConfigured()) {
      await execute(
        `INSERT INTO full_corpus_execution_runs_v29
          (run_key, environment, min_entries, status, total_entries, audio_asset_count, source_phon_count, duplicate_count, license_blocker_count, forbidden_relation_hits, dialect_counts_json, report_json, finished_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS JSON), CAST(? AS JSON), NOW())
         ON DUPLICATE KEY UPDATE status=VALUES(status), total_entries=VALUES(total_entries), audio_asset_count=VALUES(audio_asset_count), source_phon_count=VALUES(source_phon_count), duplicate_count=VALUES(duplicate_count), license_blocker_count=VALUES(license_blocker_count), forbidden_relation_hits=VALUES(forbidden_relation_hits), dialect_counts_json=VALUES(dialect_counts_json), report_json=VALUES(report_json), finished_at=NOW()`,
        [key, body.environment ?? 'staging', Number(body.required_min_entries ?? body.requiredMinEntries ?? 1000), status, totalEntries, Number(body.audio_asset_count ?? body.audioAssetCount ?? 0), Number(body.source_phon_count ?? body.sourcePhonCount ?? 0), Number(body.duplicate_count ?? body.duplicateCount ?? 0), Number(body.license_blocker_count ?? body.licenseBlockerCount ?? 0), Number(body.forbidden_relation_hits ?? body.forbiddenRelationHits ?? 0), JSON.stringify(body.dialects ?? {}), JSON.stringify(body)]
      );
    }
    res.json({ ok: true, data: { runKey: key, status, totalEntries, persisted: isDbConfigured() } });
  });

  app.get('/api/admin/corpus/v29/runs', async (_req: Request, res: Response) => {
    const rows = await safeRows('SELECT run_key, environment, status, total_entries, audio_asset_count, source_phon_count, forbidden_relation_hits, created_at, finished_at FROM full_corpus_execution_runs_v29 ORDER BY created_at DESC LIMIT 20', [], [
      { run_key: 'v29-embedded-preview-honest-failure', environment: 'development', status: 'failed', total_entries: 80, audio_asset_count: 80, source_phon_count: 80, forbidden_relation_hits: 0 }
    ]);
    res.json({ ok: true, data: { runs: rows, note: rows.length && rows[0].total_entries < 1000 ? 'preview subset is not full corpus' : null } });
  });

  app.post('/api/internal/search/v29/populate-db', async (req: Request, res: Response) => {
    const key = req.body?.runKey ?? runKey('search-pop-v29');
    if (isDbConfigured()) {
      await execute(`INSERT INTO search_index_population_runs_v29 (run_key, status, started_at) VALUES (?, 'queued', NOW()) ON DUPLICATE KEY UPDATE status='queued'`, [key]);
    }
    res.json({ ok: true, data: { runKey: key, queued: true, builder: 'scripts/build_search_index_population_v29.py', persisted: isDbConfigured() } });
  });

  app.get('/api/ops/search/v29/population-runs', async (_req: Request, res: Response) => {
    const rows = await safeRows('SELECT run_key, status, inserted_count, updated_count, skipped_forbidden_count, skipped_not_public_count, created_at, finished_at FROM search_index_population_runs_v29 ORDER BY created_at DESC LIMIT 20');
    res.json({ ok: true, data: { runs: rows, targetTable: 'search_index_documents_v27' } });
  });

  app.get('/api/ops/fallback/v29/route-coverage', async (_req: Request, res: Response) => {
    const rows = await safeRows('SELECT route_group, fallback_policy, production_covered, middleware_name, last_checked_at FROM fallback_route_coverage_v29 ORDER BY route_group');
    const uncovered = rows.filter((r: any) => !r.production_covered && r.fallback_policy === 'db_required').length;
    res.json({ ok: true, data: { routeCoverage: rows, uncoveredDbRequiredRoutes: uncovered } });
  });

  app.post('/api/internal/fallback/v29/coverage-report', async (req: Request, res: Response) => {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (isDbConfigured()) {
      for (const item of items) {
        await execute(`INSERT INTO fallback_route_coverage_v29 (route_group, fallback_policy, production_covered, middleware_name, last_checked_at, finding_json) VALUES (?, ?, ?, ?, NOW(), CAST(? AS JSON)) ON DUPLICATE KEY UPDATE fallback_policy=VALUES(fallback_policy), production_covered=VALUES(production_covered), middleware_name=VALUES(middleware_name), last_checked_at=NOW(), finding_json=VALUES(finding_json)`, [item.routeGroup, item.fallbackPolicy ?? 'db_required', Boolean(item.productionCovered), item.middlewareName ?? null, JSON.stringify(item)]);
      }
    }
    res.json({ ok: true, data: { accepted: items.length, persisted: isDbConfigured() } });
  });

  app.get('/api/ops/vps-db/v29/backup-restore-checksum', async (_req: Request, res: Response) => {
    const rows = await safeRows('SELECT report_key, backup_file, backup_sha256, target_database, status, created_at, verified_at FROM vps_backup_restore_checksum_reports_v29 ORDER BY created_at DESC LIMIT 20');
    res.json({ ok: true, data: { reports: rows } });
  });

  app.post('/api/internal/vps-db/v29/backup-restore-checksum', async (req: Request, res: Response) => {
    const body = req.body ?? {};
    const key = body.reportKey ?? runKey('restore-checksum-v29');
    if (isDbConfigured()) {
      await execute(`INSERT INTO vps_backup_restore_checksum_reports_v29 (report_key, backup_file, backup_sha256, target_database, status, row_counts_json, checksums_json, operator, report_json, verified_at) VALUES (?, ?, ?, ?, ?, CAST(? AS JSON), CAST(? AS JSON), ?, CAST(? AS JSON), NOW()) ON DUPLICATE KEY UPDATE status=VALUES(status), row_counts_json=VALUES(row_counts_json), checksums_json=VALUES(checksums_json), report_json=VALUES(report_json), verified_at=NOW()`, [key, body.backupFile ?? 'unknown', body.backupSha256 ?? null, body.targetDatabase ?? 'pinuyumayan_kb_restore', body.status ?? 'manual_review', JSON.stringify(body.rowCounts ?? {}), JSON.stringify(body.checksums ?? {}), body.operator ?? null, JSON.stringify(body)]);
    }
    res.json({ ok: true, data: { reportKey: key, persisted: isDbConfigured() } });
  });

  app.get('/api/admin/source-candidates/v29/reviews', async (_req: Request, res: Response) => {
    const rows = await safeRows('SELECT candidate_key, adapter_key, publisher, license_status, review_status, forbidden_relation_hit, duplicate_claim_hit, created_at FROM source_candidate_human_reviews_v29 ORDER BY created_at DESC LIMIT 50');
    res.json({ ok: true, data: { items: rows, policy: 'candidate-only; no auto-public claims' } });
  });

  app.get('/api/ops/next-upgrade-plan/v30', (_req: Request, res: Response) => {
    res.json({ ok: true, data: { version: 'v30', title: 'Production Cutover + Main Site Move', source: 'data/development/next_upgrade_plan_v30.json' } });
  });
}
