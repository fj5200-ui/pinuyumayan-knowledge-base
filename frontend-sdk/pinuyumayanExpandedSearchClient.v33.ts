export type ExpandedSearchClientOptions = { baseUrl: string; fetchImpl?: typeof fetch };
export function createPinuyumayanExpandedSearchClient(options: ExpandedSearchClientOptions) {
  const f = options.fetchImpl ?? fetch;
  const base = options.baseUrl.replace(/\/$/, "");
  async function getJson<T>(path: string): Promise<T> {
    const res = await f(`${base}${path}`);
    if (!res.ok) throw new Error(`KB request failed ${res.status}: ${path}`);
    return res.json() as Promise<T>;
  }
  return {
    getExpandedPlan: () => getJson('/api/ops/source-search/v33/expanded-plan'),
    getCandidateQueue: () => getJson('/api/ops/source-search/v33/candidates'),
    getPublicCards: () => getJson('/api/public/true-knowledge/v33/cards'),
    getSearchDocuments: () => getJson('/api/public/true-knowledge/v33/search-documents'),
    getSourcePackets: () => getJson('/api/public/ai-article/v33/source-packets'),
    getForbiddenRelationPolicy: () => getJson('/api/ops/forbidden-relations/v33/audit'),
  };
}
