export type PinuyumayanTtsSttMusicV44ClientOptions = { baseUrl: string; fetcher?: typeof fetch };

export function createTtsSttMusicClientV44(options: PinuyumayanTtsSttMusicV44ClientOptions) {
  const fetcher = options.fetcher ?? fetch;
  const base = options.baseUrl.replace(/\/$/, "");
  async function getJson(path: string) {
    const res = await fetcher(`${base}${path}`);
    if (!res.ok) throw new Error(`Request failed ${res.status}: ${path}`);
    return res.json();
  }
  async function postJson(path: string, body: unknown) {
    const res = await fetcher(`${base}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Request failed ${res.status}: ${path}`);
    return res.json();
  }
  return {
    authorizedReview: () => getJson("/api/ops/speech-training/v44/authorized-review"),
    exportContract: () => getJson("/api/ops/speech-training/v44/export-contract"),
    musicDbContract: () => getJson("/api/ops/search/music/v44/db-contract"),
    authorityWorkerContract: () => getJson("/api/ops/authority-sources/v44/worker-contract"),
    reviewCenter: () => getJson("/api/admin/music-speech/v44/review-center"),
    ttsSttInfo: () => getJson("/api/public/speech/v44/tts-stt-info"),
    musicMetadata: (id: string) => getJson(`/api/public/music/v44/metadata/${encodeURIComponent(id)}`),
    searchMusic: (q: string, params: Record<string, string> = {}) => {
      const url = new URL(`${base}/api/public/search/music/v43`);
      if (q) url.searchParams.set("q", q);
      Object.entries(params).forEach(([key, value]) => value && url.searchParams.set(key, value));
      return getJson(`${url.pathname}${url.search}`);
    },
    exportReport: (body: unknown) => postJson("/api/internal/speech-training/v44/export-report", body),
    candidateIngest: (body: unknown) => postJson("/api/internal/authority-sources/v44/candidate-ingest", body),
    nextPlan: () => getJson("/api/ops/next-upgrade-plan/v45"),
  };
}
