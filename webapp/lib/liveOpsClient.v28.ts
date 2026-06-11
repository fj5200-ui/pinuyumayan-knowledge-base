export type LiveOpsClientOptions = { baseUrl: string; fetcher?: typeof fetch };

export function createLiveOpsClientV28(options: LiveOpsClientOptions) {
  const fetcher = options.fetcher ?? fetch;
  const baseUrl = options.baseUrl.replace(/\/$/, '');
  async function get<T>(path: string): Promise<T> {
    const res = await fetcher(`${baseUrl}${path}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return res.json() as Promise<T>;
  }
  return {
    dataMode: () => get('/api/ops/data-mode/v28/status'),
    corpusAcceptance: () => get('/api/admin/corpus/v28/acceptance-latest'),
    searchStatus: () => get('/api/ops/search/v28/index-status'),
    hmacFailures: () => get('/api/ops/security/v28/hmac-failures'),
    restoreDrills: () => get('/api/ops/vps-db/v28/restore-drills')
  };
}
