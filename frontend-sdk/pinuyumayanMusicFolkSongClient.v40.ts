export type MusicV40ClientOptions = { baseUrl: string; fetcher?: typeof fetch };
export function createMusicFolkSongV40Client(options: MusicV40ClientOptions) {
  const fetcher = options.fetcher ?? fetch; const base = options.baseUrl.replace(/\/$/, "");
  const getJson = async <T>(path: string): Promise<T> => { const res = await fetcher(`${base}${path}`); if (!res.ok) throw new Error(`Music v40 request failed: ${res.status}`); return res.json() as Promise<T>; };
  return { sourceRegistry: () => getJson("/api/ops/music-folk-song/v40/source-registry"), catalog: () => getJson("/api/ops/music-folk-song/v40/catalog"), cards: () => getJson("/api/public/true-knowledge/v40/music/cards"), searchDocuments: () => getJson("/api/public/true-knowledge/v40/music/search-documents"), claims: () => getJson("/api/public/true-knowledge/v40/music/claims"), sourcePackets: () => getJson("/api/public/ai-article/v40/music-source-packets"), rightsPolicy: () => getJson("/api/ops/music-folk-song/v40/rights-policy") };
}
