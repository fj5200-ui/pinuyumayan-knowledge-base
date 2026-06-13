export type PinuyumayanTtsSttMusicV45ClientOptions = { baseUrl: string; fetcher?: typeof fetch };

export function createTtsSttMusicClientV45(options: PinuyumayanTtsSttMusicV45ClientOptions) {
  const fetcher = options.fetcher ?? fetch;
  const base = options.baseUrl.replace(/\/$/, "");
  async function getJson(path: string) {
    const res = await fetcher(`${base}${path}`);
    if (!res.ok) throw new Error(`Request failed ${res.status}: ${path}`);
    return res.json();
  }
  async function postJson(path: string, body: unknown) {
    const res = await fetcher(`${base}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`Request failed ${res.status}: ${path}`);
    return res.json();
  }
  return {
    reviewWorkflow: () => getJson("/api/ops/speech-training/v45/review-workflow"),
    alignmentImportContract: () => getJson("/api/ops/speech-training/v45/alignment-import-contract"),
    searchQuality: () => getJson("/api/ops/search/music/v45/quality-contract"),
    authorityFetchWorker: () => getJson("/api/ops/authority-sources/v45/fetch-worker-contract"),
    governanceReport: () => getJson("/api/ops/speech-training/v45/governance-report"),
    musicSeo: (id: string) => getJson(`/api/public/music/v45/seo/${encodeURIComponent(id)}`),
    sitemapContract: () => getJson("/api/ops/site/v45/sitemap-contract"),
    vpsPreflight: () => getJson("/api/ops/vps/v45/preflight-contract"),
    reviewCenter: () => getJson("/api/admin/music-speech/v45/review-center"),
    nextPlan: () => getJson("/api/ops/next-upgrade-plan/v46"),
    reviewDecision: (body: unknown) => postJson("/api/internal/speech-training/v45/review-decision", body),
    alignmentImport: (body: unknown) => postJson("/api/internal/speech-training/v45/alignment-import", body),
    authorityFetchRunReport: (body: unknown) => postJson("/api/internal/authority-sources/v45/fetch-run-report", body),
  };
}
