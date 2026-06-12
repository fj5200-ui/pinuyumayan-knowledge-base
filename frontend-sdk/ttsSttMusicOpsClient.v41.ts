export function createTtsSttMusicOpsClient(baseUrl: string, internalHeaders?: Record<string, string>) {
  async function getJson(path: string) { const r = await fetch(`${baseUrl}${path}`); if (!r.ok) throw new Error(`GET ${path} failed: ${r.status}`); return r.json(); }
  async function postJson(path: string, body: unknown) { const r = await fetch(`${baseUrl}${path}`, { method: "POST", headers: { "content-type": "application/json", ...(internalHeaders ?? {}) }, body: JSON.stringify(body ?? {}) }); if (!r.ok) throw new Error(`POST ${path} failed: ${r.status}`); return r.json(); }
  return {
    getSpeechTrainingPolicy: () => getJson("/api/ops/speech-training/v41/policy"),
    getSpeechTrainingManifest: () => getJson("/api/ops/speech-training/v41/manifest"),
    getMusicReviewQueue: () => getJson("/api/ops/music-folk-song/v41/review-queue"),
    getYoutubeWorkerContract: () => getJson("/api/ops/music-folk-song/v41/youtube-worker-contract"),
    submitYoutubeMetadataReport: (body: unknown) => postJson("/api/internal/music-folk-song/v41/youtube-metadata-report", body),
    runMusicGroundingCheck: (body: unknown) => postJson("/api/internal/ai-article/v41/music-grounding-check", body),
  };
}
