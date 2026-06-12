export type MusicFolkSongV38ClientOptions = { baseUrl: string; fetchImpl?: typeof fetch };

export function createMusicFolkSongV38Client(options: MusicFolkSongV38ClientOptions) {
  const f = options.fetchImpl ?? fetch;
  const base = options.baseUrl.replace(/\/$/, "");
  async function getJson<T>(path: string): Promise<T> {
    const res = await f(`${base}${path}`);
    if (!res.ok) throw new Error(`Music folk song v38 request failed: ${res.status}`);
    return res.json() as Promise<T>;
  }
  return {
    catalog: () => getJson<any>("/api/ops/music-folk-song/v38/catalog"),
    variantIndex: () => getJson<any>("/api/ops/music-folk-song/v38/variant-index"),
    reviewQueue: () => getJson<any>("/api/ops/music-folk-song/v38/review-queue"),
    publicCards: () => getJson<any>("/api/public/true-knowledge/v38/music/cards"),
    publicClaims: () => getJson<any>("/api/public/true-knowledge/v38/music/claims"),
    sourcePackets: () => getJson<any>("/api/public/ai-article/v38/music-source-packets"),
    nextPlan: () => getJson<any>("/api/ops/next-upgrade-plan/v39"),
  };
}
