export type PinuyumayanTtsSttLiveClientOptions = { baseUrl: string; fetcher?: typeof fetch };
export function createTtsSttLiveMusicClientV43(options: PinuyumayanTtsSttLiveClientOptions) {
  const fetcher = options.fetcher ?? fetch;
  const base = options.baseUrl.replace(/\/$/, "");
  async function getJson(path: string) { const res = await fetcher(`${base}${path}`); if (!res.ok) throw new Error(`Request failed ${res.status}: ${path}`); return res.json(); }
  async function postJson(path: string, body: unknown) { const res = await fetcher(`${base}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); if (!res.ok) throw new Error(`Request failed ${res.status}: ${path}`); return res.json(); }
  return { authorizedReview: () => getJson("/api/ops/speech-training/v43/authorized-review"), modelWorkspace: () => getJson("/api/ops/speech-training/v43/model-workspace"), evaluationDashboard: () => getJson("/api/ops/speech-training/v43/evaluation-dashboard"), searchMusic: (q: string) => getJson(`/api/public/search/music/v43?q=${encodeURIComponent(q)}`), sourcePackets: () => getJson("/api/public/ai-article/v43/music-speech-source-packets"), groundingCheck: (body: unknown) => postJson("/api/internal/ai-article/v43/music-speech-grounding-check", body) };
}
