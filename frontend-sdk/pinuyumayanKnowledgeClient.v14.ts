export interface PinuyumayanClientOptions {
  baseUrl: string;
  apiKey?: string;
}

export class PinuyumayanKnowledgeClientV14 {
  constructor(private readonly options: PinuyumayanClientOptions) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    if (this.options.apiKey) headers.set("x-pinuyumayan-main-site-key", this.options.apiKey);
    const res = await fetch(`${this.options.baseUrl}${path}`, { ...init, headers });
    if (!res.ok) throw new Error(`Pinuyumayan API error ${res.status}: ${await res.text()}`);
    return res.json() as Promise<T>;
  }

  bootstrap() { return this.request("/api/public/knowledge/bootstrap"); }
  search(q: string, limit = 20) { return this.request(`/api/public/knowledge/search?q=${encodeURIComponent(q)}&limit=${limit}`); }
  suggest(q: string) { return this.request(`/api/public/search/suggest?q=${encodeURIComponent(q)}`); }
  facets() { return this.request("/api/public/search/facets"); }
  vocabulary(params: { dialectCode?: string; limit?: number; cursor?: string } = {}) {
    const qs = new URLSearchParams();
    if (params.dialectCode) qs.set("dialectCode", params.dialectCode);
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.cursor) qs.set("cursor", params.cursor);
    return this.request(`/api/public/knowledge/vocabulary?${qs}`);
  }
  exportLatest() { return this.request("/api/public/knowledge/export/latest"); }
  delta(since: string) { return this.request(`/api/internal/main-site/knowledge/delta?since=${encodeURIComponent(since)}`); }
  invalidateCache(target: string, reason: string) {
    return this.request("/api/internal/cache/invalidate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ target, reason }) });
  }
}
