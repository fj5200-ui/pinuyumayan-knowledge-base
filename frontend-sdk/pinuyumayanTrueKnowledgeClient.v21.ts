export type TrueKnowledgeClientOptions = { baseUrl: string; internalApiKey?: string };

async function request<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, init);
  if (!res.ok) throw new Error(`Pinuyumayan KB request failed: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export function createPinuyumayanTrueKnowledgeClientV21(options: TrueKnowledgeClientOptions) {
  return {
    listClaims: () => request(options.baseUrl, '/api/public/true-knowledge/v21/claims'),
    listCards: () => request(options.baseUrl, '/api/public/true-knowledge/v21/cards'),
    listFrontendSourcePackets: () => request(options.baseUrl, '/api/public/ai-article/v21/source-packets'),
    getForbiddenRelations: () => request(options.baseUrl, '/api/public/knowledge/forbidden-relations/v21'),
    blockedRelationCheck: (draft: { title?: string; body?: string; sourceIds?: string[]; tags?: string[] }) => request(options.baseUrl, '/api/internal/ai-article/v21/blocked-relation-check', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(options.internalApiKey ? { 'x-pinuyumayan-main-site-key': options.internalApiKey } : {})
      },
      body: JSON.stringify(draft)
    })
  };
}
