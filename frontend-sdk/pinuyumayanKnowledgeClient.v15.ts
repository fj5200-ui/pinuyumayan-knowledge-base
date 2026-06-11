export type PinuyumayanClientOptionsV15 = {
  baseUrl: string;
  apiKey?: string;
  fetchImpl?: typeof fetch;
};

export class PinuyumayanKnowledgeClientV15 {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: PinuyumayanClientOptionsV15) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private async get<T>(path: string, internal = false): Promise<T> {
    const headers: Record<string, string> = { accept: "application/json" };
    if (internal && this.apiKey) headers["x-pinuyumayan-main-site-key"] = this.apiKey;
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, { headers });
    if (!response.ok) throw new Error(`Pinuyumayan API ${response.status}: ${path}`);
    return response.json() as Promise<T>;
  }

  version() { return this.get("/api/public/version"); }
  bootstrap() { return this.get("/api/public/knowledge/bootstrap"); }
  vocabulary(params: { dialectCode?: string; limit?: number; cursor?: string } = {}) {
    const q = new URLSearchParams();
    if (params.dialectCode) q.set("dialectCode", params.dialectCode);
    if (params.limit) q.set("limit", String(params.limit));
    if (params.cursor) q.set("cursor", params.cursor);
    return this.get(`/api/public/knowledge/vocabulary?${q.toString()}`);
  }
  search(qText: string) { return this.get(`/api/public/knowledge/search?q=${encodeURIComponent(qText)}`); }
  suggest(qText: string) { return this.get(`/api/public/search/suggest?q=${encodeURIComponent(qText)}`); }
  latestExport() { return this.get("/api/public/knowledge/export/latest"); }
  delta(since: string) { return this.get(`/api/internal/main-site/knowledge/delta?since=${encodeURIComponent(since)}`, true); }
  enqueueCorpusReconciliation() { return this.get("/api/admin/corpus/reconciliation"); }
}
