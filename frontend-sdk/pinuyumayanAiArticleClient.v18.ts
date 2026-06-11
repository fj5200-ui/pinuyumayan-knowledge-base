export type AiArticleClientOptions = {
  baseUrl: string;
  internalApiKey?: string;
};

export function createPinuyumayanAiArticleClient(options: AiArticleClientOptions) {
  const baseUrl = options.baseUrl.replace(/\/$/, "");
  const internalHeaders = () => ({
    "content-type": "application/json",
    ...(options.internalApiKey ? { "x-pinuyumayan-main-site-key": options.internalApiKey } : {})
  });
  async function getJson<T>(path: string): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`);
    if (!res.ok) throw new Error(`Request failed ${res.status}: ${path}`);
    return res.json() as Promise<T>;
  }
  async function postJson<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, { method: "POST", headers: internalHeaders(), body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`Request failed ${res.status}: ${path}`);
    return res.json() as Promise<T>;
  }
  return {
    listSourcePackets: (topic?: string) => getJson(`/api/public/ai-article/source-packets${topic ? `?topic=${encodeURIComponent(topic)}` : ""}`),
    listBlueprints: () => getJson(`/api/public/ai-article/blueprints`),
    buildDraftPlan: (input: { blueprintId: string; idea?: string; preferredTitle?: string }) => postJson(`/api/internal/ai-article/draft-plan`, input),
    duplicateCheck: (input: { title: string; slug: string; sourceClaimIds?: string[]; existingFingerprints?: string[] }) => postJson(`/api/internal/ai-article/duplicate-check`, input),
    publishCheck: (draftPlan: unknown) => postJson(`/api/internal/ai-article/publish-check`, { draftPlan })
  };
}
