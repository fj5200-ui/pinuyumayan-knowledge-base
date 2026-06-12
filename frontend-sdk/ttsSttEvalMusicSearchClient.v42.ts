export type ClientOptions = { baseUrl: string; internalHeaders?: Record<string,string> };
export function createTtsSttEvalMusicSearchClientV42(opts: ClientOptions) {
  const base = opts.baseUrl.replace(/\/$/, "");
  async function get(path: string) { const r = await fetch(base + path); if (!r.ok) throw new Error(`${r.status} ${path}`); return r.json(); }
  async function post(path: string, body: unknown) { const r = await fetch(base + path, { method: "POST", headers: { "content-type": "application/json", ...(opts.internalHeaders ?? {}) }, body: JSON.stringify(body ?? {}) }); if (!r.ok) throw new Error(`${r.status} ${path}`); return r.json(); }
  return {
    getAuthorizedReview: () => get("/api/ops/speech-training/v42/authorized-review"),
    getDatasetSplit: () => get("/api/ops/speech-training/v42/dataset-split"),
    getEvaluationSchema: () => get("/api/ops/speech-training/v42/evaluation-schema"),
    searchMusic: (q: string) => get(`/api/public/search/music?q=${encodeURIComponent(q)}`),
    submitEvaluationReport: (body: unknown) => post("/api/internal/speech-training/v42/evaluation-report", body),
    runGroundingCheck: (body: unknown) => post("/api/internal/ai-article/v42/music-speech-grounding-check", body),
  };
}
