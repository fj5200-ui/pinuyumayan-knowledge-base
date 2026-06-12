export type MusicSongClientV36Options = { baseUrl: string };
async function getJson(baseUrl: string, path: string) { const res = await fetch(`${baseUrl}${path}`); if (!res.ok) throw new Error(`KB API ${res.status}`); return res.json(); }
export function createPinuyumayanMusicSongClientV36(options: MusicSongClientV36Options) {
  const baseUrl = options.baseUrl.replace(/\/$/, "");
  return {
    catalog: () => getJson(baseUrl, "/api/ops/music-song/v36/catalog"),
    cards: () => getJson(baseUrl, "/api/public/true-knowledge/v36/music/cards"),
    searchDocuments: () => getJson(baseUrl, "/api/public/true-knowledge/v36/music/search-documents"),
    sourcePackets: () => getJson(baseUrl, "/api/public/ai-article/v36/music-source-packets"),
    rightsPolicy: () => getJson(baseUrl, "/api/ops/music-song/v36/rights-policy"),
  };
}
