export function createVpsActualOpsClientV29(baseUrl: string, fetcher: typeof fetch = fetch) {
  const base = baseUrl.replace(/\/$/, '');
  async function get(path: string) {
    const res = await fetcher(`${base}${path}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
    return res.json();
  }
  return {
    readiness: () => get('/api/ops/vps/v29/readiness'),
    corpusRuns: () => get('/api/admin/corpus/v29/runs'),
    searchRuns: () => get('/api/ops/search/v29/population-runs'),
    fallbackCoverage: () => get('/api/ops/fallback/v29/route-coverage'),
    backupChecksums: () => get('/api/ops/vps-db/v29/backup-restore-checksum'),
    sourceCandidateReviews: () => get('/api/admin/source-candidates/v29/reviews')
  };
}
