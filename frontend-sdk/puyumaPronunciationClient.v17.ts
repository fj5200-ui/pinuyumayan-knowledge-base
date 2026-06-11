export type PronunciationAsset = {
  assetId: string;
  entryId: string;
  puyumaForm?: string;
  zhTw?: string;
  dialectCode?: string;
  dialectZh?: string;
  sourceAudioUrl?: string;
  proxyUrl?: string;
  mimeType?: string;
  reviewStatus?: string;
};

export type PronunciationClientOptions = {
  baseUrl: string;
  preferProxy?: boolean;
  fetchImpl?: typeof fetch;
};

async function readJson<T>(fetchImpl: typeof fetch, url: string): Promise<T> {
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(`Pinuyumayan pronunciation API failed: ${res.status}`);
  const payload = await res.json();
  return payload.data as T;
}

export function createPuyumaPronunciationClient(options: PronunciationClientOptions) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const base = options.baseUrl.replace(/\/$/, "");

  return {
    async manifest(): Promise<{ entries: PronunciationAsset[]; policy: unknown; counts: unknown }> {
      return readJson(fetchImpl, `${base}/api/public/audio/manifest`);
    },
    async search(params: { q?: string; dialectCode?: string; limit?: number } = {}): Promise<PronunciationAsset[]> {
      const qs = new URLSearchParams();
      if (params.q) qs.set("q", params.q);
      if (params.dialectCode) qs.set("dialectCode", params.dialectCode);
      if (params.limit) qs.set("limit", String(params.limit));
      const data = await readJson<{ items: PronunciationAsset[] }>(fetchImpl, `${base}/api/public/pronunciation/search?${qs}`);
      return data.items;
    },
    async getHead(assetId: string): Promise<PronunciationAsset & { playback: { sourceAudioUrl: string; proxyUrl: string } }> {
      return readJson(fetchImpl, `${base}/api/public/audio/head/${encodeURIComponent(assetId)}`);
    },
    audioUrl(asset: PronunciationAsset): string | undefined {
      if (options.preferProxy && asset.proxyUrl) return `${base}${asset.proxyUrl}`;
      return asset.sourceAudioUrl || (asset.proxyUrl ? `${base}${asset.proxyUrl}` : undefined);
    },
    async playerConfig() {
      return readJson(fetchImpl, `${base}/api/public/pronunciation/player-config`);
    }
  };
}
