export type TtsSttMusicClientV46Options = { baseUrl: string; fetchImpl?: typeof fetch };

export function createTtsSttMusicClientV46(options: TtsSttMusicClientV46Options) {
  const f = options.fetchImpl ?? fetch;
  const base = options.baseUrl.replace(/\/$/, "");
  async function get(path: string) {
    const res = await f(`${base}${path}`);
    if (!res.ok) throw new Error(`Pinuyumayan v46 API ${res.status}: ${path}`);
    return res.json();
  }
  async function post(path: string, body: unknown, headers: Record<string, string> = {}) {
    const res = await f(`${base}${path}`, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body ?? {}) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`Pinuyumayan v46 API ${res.status}: ${JSON.stringify(json)}`);
    return json;
  }
  return {
    reviewerQueue: () => get("/api/ops/speech-training/v46/reviewer-queue"),
    searchObservability: () => get("/api/ops/search/music/v46/observability-dashboard"),
    authorityGovernance: () => get("/api/ops/authority-sources/v46/fetch-governance"),
    experimentRegistry: () => get("/api/ops/speech-training/v46/experiment-registry"),
    siteExperience: () => get("/api/ops/site/v46/experience-contract"),
    reviewCenter: () => get("/api/admin/music-speech/v46/review-center"),
    vpsPreflight: () => get("/api/ops/vps/v46/preflight-contract"),
    nextUpgradePlan: () => get("/api/ops/next-upgrade-plan/v47"),
    assignReviewer: (body: unknown, headers?: Record<string,string>) => post("/api/internal/speech-training/v46/assign-reviewer", body, headers),
    transactionalReviewDecision: (body: unknown, headers?: Record<string,string>) => post("/api/internal/speech-training/v46/transactional-review-decision", body, headers),
    transactionalAlignmentImport: (body: unknown, headers?: Record<string,string>) => post("/api/internal/speech-training/v46/transactional-alignment-import", body, headers),
    logMusicQuery: (body: unknown, headers?: Record<string,string>) => post("/api/internal/search/music/v46/query-log", body, headers),
    retryOrMergeAuthoritySource: (body: unknown, headers?: Record<string,string>) => post("/api/internal/authority-sources/v46/retry-or-merge", body, headers),
    modelExperimentDecision: (body: unknown, headers?: Record<string,string>) => post("/api/internal/speech-training/v46/model-experiment-decision", body, headers),
  };
}
