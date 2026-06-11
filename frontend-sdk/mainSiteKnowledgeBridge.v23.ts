export type MainSiteKnowledgeBridgeConfig = {
  publicBaseUrl: string;
  internalBaseUrl?: string;
  apiKey?: string;
  hmacSecret?: string;
  clientId?: string;
};

export function createMainSiteKnowledgeBridge(config: MainSiteKnowledgeBridgeConfig) {
  async function publicGet<T>(pathWithQuery: string): Promise<T> {
    const res = await fetch(`${config.publicBaseUrl}${pathWithQuery}`);
    if (!res.ok) throw new Error(`Public knowledge API failed: ${res.status}`);
    return res.json() as Promise<T>;
  }

  return {
    bootstrap: () => publicGet('/api/public/knowledge/bootstrap'),
    search: (q: string) => publicGet(`/api/public/knowledge/search?q=${encodeURIComponent(q)}`),
    vocabulary: (params: { dialectCode?: string; limit?: number; cursor?: string } = {}) => {
      const qs = new URLSearchParams();
      if (params.dialectCode) qs.set('dialectCode', params.dialectCode);
      if (params.limit) qs.set('limit', String(params.limit));
      if (params.cursor) qs.set('cursor', params.cursor);
      return publicGet(`/api/public/knowledge/vocabulary?${qs}`);
    },
    composerConfig: () => publicGet('/api/public/ai-article/frontend-composer-config'),
    sourcePackets: (blueprintId?: string) => publicGet(`/api/public/ai-article/v21/source-packets${blueprintId ? `?blueprintId=${encodeURIComponent(blueprintId)}` : ''}`),
    forbiddenRelations: () => publicGet('/api/public/knowledge/forbidden-relations/v21'),
    audioManifest: () => publicGet('/api/public/audio/manifest'),
    pronunciationSearch: (q: string) => publicGet(`/api/public/pronunciation/search?q=${encodeURIComponent(q)}`)
  };
}
