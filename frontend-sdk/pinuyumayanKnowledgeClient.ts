export type KnowledgeClientOptions = {
  baseUrl: string;
  apiKey?: string;
  fetchImpl?: typeof fetch;
};

export class PinuyumayanKnowledgeClient {
  private baseUrl: string;
  private apiKey?: string;
  private fetchImpl: typeof fetch;

  constructor(options: KnowledgeClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private async get<T>(path: string, internal = false): Promise<T> {
    const headers: Record<string, string> = { "Accept": "application/json" };
    if (internal && this.apiKey) headers["x-pinuyumayan-main-site-key"] = this.apiKey;
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, { headers, next: { revalidate: internal ? 0 : 300 } as any });
    if (!res.ok) throw new Error(`Pinuyumayan API error ${res.status}: ${await res.text()}`);
    return res.json() as Promise<T>;
  }

  bootstrap() {
    return this.get("/api/public/knowledge/bootstrap");
  }

  search(q: string, limit = 20) {
    const params = new URLSearchParams({ q, limit: String(limit) });
    return this.get(`/api/public/knowledge/search?${params}`);
  }

  related(entityType: string, entityId: string, limit = 12) {
    const params = new URLSearchParams({ entityType, entityId, limit: String(limit) });
    return this.get(`/api/public/knowledge/related?${params}`);
  }

  community(communityKey: string) {
    return this.get(`/api/public/knowledge/communities/${encodeURIComponent(communityKey)}`);
  }

  vocabulary(params: { dialectCode?: string; categoryKey?: string; q?: string; limit?: number } = {}) {
    const qs = new URLSearchParams();
    if (params.dialectCode) qs.set("dialectCode", params.dialectCode);
    if (params.categoryKey) qs.set("categoryKey", params.categoryKey);
    if (params.q) qs.set("q", params.q);
    qs.set("limit", String(params.limit ?? 20));
    return this.get(`/api/public/knowledge/vocabulary?${qs}`);
  }

  internalBundle(params: { includeVocabulary?: boolean; vocabularyLimit?: number } = {}) {
    const qs = new URLSearchParams({
      includeVocabulary: String(params.includeVocabulary ?? true),
      vocabularyLimit: String(params.vocabularyLimit ?? 80)
    });
    return this.get(`/api/internal/main-site/knowledge/bundle?${qs}`, true);
  }

  delta(since: string, limit = 100) {
    const qs = new URLSearchParams({ since, limit: String(limit) });
    return this.get(`/api/internal/main-site/knowledge/delta?${qs}`, true);
  }
}
