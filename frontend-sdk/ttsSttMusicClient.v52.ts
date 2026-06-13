export const ttsSttMusicV52Endpoints = {
  reviewCenter: "/api/admin/music-speech/v52/review-center",
  goLiveExecution: "/api/ops/vps/v52/go-live-execution",
  evidenceChain: "/api/admin/speech-training/v52/evidence-chain",
  searchAbConvergence: "/api/ops/search/music/v52/ab-convergence",
  authorityPublicRelease: "/api/ops/authority-sources/v52/public-release",
  modelSignoff: "/api/ops/speech-training/v52/model-signoff",
  sitePerformanceMonitoring: "/api/ops/site/v52/performance-monitoring",
  nextUpgradePlan: "/api/ops/next-upgrade-plan/v53"
} as const;
export type TtsSttMusicV52EndpointKey = keyof typeof ttsSttMusicV52Endpoints;
export async function fetchTtsSttMusicV52<T>(key: TtsSttMusicV52EndpointKey, baseUrl = "") : Promise<T> {
  const res = await fetch(`${baseUrl}${ttsSttMusicV52Endpoints[key]}`);
  if (!res.ok) throw new Error(`v52 request failed: ${res.status}`);
  return res.json() as Promise<T>;
}
