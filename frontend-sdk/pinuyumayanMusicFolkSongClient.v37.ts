export type MusicFolkSongClientOptions = { baseUrl: string; fetchImpl?: typeof fetch };
export function createPinuyumayanMusicFolkSongClientV37(options: MusicFolkSongClientOptions) {
  const f = options.fetchImpl ?? fetch;
  const base = options.baseUrl.replace(/\/$/, "");
  async function getJson<T>(path: string): Promise<T> {
    const res = await f(`${base}${path}`);
    if (!res.ok) throw new Error(`KB request failed ${res.status}: ${path}`);
    return res.json() as Promise<T>;
  }
  return {
    catalog: () => getJson('/api/ops/music-folk-song/v37/catalog'),
    reviewQueue: () => getJson('/api/ops/music-folk-song/v37/review-queue'),
    cards: () => getJson('/api/public/true-knowledge/v37/music/cards'),
    searchDocuments: () => getJson('/api/public/true-knowledge/v37/music/search-documents'),
    claims: () => getJson('/api/public/true-knowledge/v37/music/claims'),
    sourcePackets: () => getJson('/api/public/ai-article/v37/music-source-packets'),
    rightsPolicy: () => getJson('/api/ops/music-folk-song/v37/rights-policy'),
  };
}
