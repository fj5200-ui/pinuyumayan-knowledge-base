export type V34ClientOptions = { baseUrl: string; fetchImpl?: typeof fetch };
export function createExpandedTrueKnowledgeClientV34(options: V34ClientOptions) {
  const f = options.fetchImpl ?? fetch;
  const base = options.baseUrl.replace(/\/$/, "");
  async function getJson<T>(path: string): Promise<T> {
    const res = await f(`${base}${path}`);
    if (!res.ok) throw new Error(`Pinuyumayan KB v34 request failed: ${res.status}`);
    return res.json() as Promise<T>;
  }
  return {
    getExpandedPlan: () => getJson('/api/ops/source-search/v34/expanded-plan'),
    getCandidates: () => getJson('/api/ops/source-search/v34/candidates'),
    getCards: () => getJson('/api/public/true-knowledge/v34/cards'),
    getSearchDocuments: () => getJson('/api/public/true-knowledge/v34/search-documents'),
    getSourcePackets: () => getJson('/api/public/ai-article/v34/source-packets'),
    getForbiddenAudit: () => getJson('/api/ops/forbidden-relations/v34/audit'),
    getNextPlan: () => getJson('/api/ops/next-upgrade-plan/v35'),
  };
}
