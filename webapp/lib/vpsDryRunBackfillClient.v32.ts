export type V32ClientOptions = { baseUrl: string; fetcher?: typeof fetch };
export function createVpsDryRunBackfillClientV32(options: V32ClientOptions) {
  const f = options.fetcher ?? fetch;
  const base = options.baseUrl.replace(/\/$/, "");
  async function getJson<T>(path: string): Promise<T> {
    const res = await f(`${base}${path}`);
    if (!res.ok) throw new Error(`V32 request failed ${res.status}: ${path}`);
    return res.json() as Promise<T>;
  }
  return {
    dryRunPlan: () => getJson('/api/ops/vps/v32/dry-run-backfill-plan'),
    secretScanPolicy: () => getJson('/api/ops/main-site/v32/migration-secret-scan'),
    hmacEnforcement: () => getJson('/api/ops/security/v32/hmac-enforcement'),
    corpusBackfill: () => getJson('/api/admin/corpus/v32/full-corpus-backfill'),
    dashboardBindings: () => getJson('/api/admin/dashboard/v32/live-bindings'),
    searchSeoSuite: () => getJson('/api/ops/search-seo/v32/validation-suite'),
    nextPlan: () => getJson('/api/ops/next-upgrade-plan/v33'),
  };
}
