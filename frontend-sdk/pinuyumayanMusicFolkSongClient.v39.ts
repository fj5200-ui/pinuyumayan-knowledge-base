export type MusicV39ClientOptions = { baseUrl: string; fetcher?: typeof fetch };
export function createMusicFolkSongV39Client(options: MusicV39ClientOptions) {
  const fetcher = options.fetcher ?? fetch;
  const base = options.baseUrl.replace(/\/$/, "");
  const getJson = async <T>(path: string): Promise<T> => {
    const res = await fetcher(`${base}${path}`);
    if (!res.ok) throw new Error(`Music v39 request failed: ${res.status}`);
    return res.json() as Promise<T>;
  };
  return {
    sourceRegistry: () => getJson("/api/ops/music-folk-song/v39/source-registry"),
    catalog: () => getJson("/api/ops/music-folk-song/v39/catalog"),
    cards: () => getJson("/api/public/true-knowledge/v39/music/cards"),
    searchDocuments: () => getJson("/api/public/true-knowledge/v39/music/search-documents"),
    claims: () => getJson("/api/public/true-knowledge/v39/music/claims"),
    sourcePackets: () => getJson("/api/public/ai-article/v39/music-source-packets"),
    rightsPolicy: () => getJson("/api/ops/music-folk-song/v39/rights-policy")
  };
}
