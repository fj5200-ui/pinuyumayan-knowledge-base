export type TrueKnowledgeClientV20Options = {
  baseUrl: string;
  internalApiKey?: string;
};

async function getJson<T>(baseUrl: string, path: string): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`);
  if (!res.ok) throw new Error(`Request failed ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export function createPinuyumayanTrueKnowledgeClientV20(options: TrueKnowledgeClientV20Options) {
  const baseUrl = options.baseUrl.replace(/\/$/, '');
  return {
    listSources: () => getJson(baseUrl, '/api/public/true-knowledge/v20/sources'),
    listClaims: () => getJson(baseUrl, '/api/public/true-knowledge/v20/claims'),
    listSourcePackets: () => getJson(baseUrl, '/api/public/true-knowledge/v20/source-packets'),
    nextUpgradePlan: () => getJson(baseUrl, '/api/ops/next-upgrade-plan'),
    duplicateCheck: async (draft: { slug?: string; title?: string; claimIds?: string[] }) => {
      const res = await fetch(`${baseUrl}/api/internal/true-knowledge/v20/deduplicate`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(options.internalApiKey ? { 'x-pinuyumayan-main-site-key': options.internalApiKey } : {}),
        },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error(`Duplicate check failed ${res.status}`);
      return res.json();
    },
  };
}
