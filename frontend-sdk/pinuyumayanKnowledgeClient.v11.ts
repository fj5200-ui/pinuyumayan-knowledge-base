export type PinuyumayanClientOptions = {
  baseUrl: string;
  apiKey?: string;
  apiVersion?: string;
  fetchImpl?: typeof fetch;
};

export class PinuyumayanKnowledgeClientV11 {
  private baseUrl: string;
  private apiKey?: string;
  private apiVersion: string;
  private fetchImpl: typeof fetch;

  constructor(options: PinuyumayanClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
    this.apiVersion = options.apiVersion ?? "2026-06-11";
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private headers(internal = false, extra?: Record<string, string>) {
    return {
      "x-pinuyumayan-api-version": this.apiVersion,
      ...(internal && this.apiKey ? { "x-pinuyumayan-main-site-key": this.apiKey } : {}),
      ...(extra ?? {})
    };
  }

  async request<T>(path: string, init?: RequestInit & { internal?: boolean; etag?: string }): Promise<{ data: T; etag: string | null; requestId: string | null }> {
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers: this.headers(Boolean(init?.internal), {
        ...(init?.etag ? { "if-none-match": init.etag } : {}),
        ...((init?.headers as Record<string, string>) ?? {})
      })
    });
    if (res.status === 304) {
      return { data: null as T, etag: res.headers.get("etag"), requestId: res.headers.get("x-request-id") };
    }
    if (!res.ok) {
      throw new Error(`Pinuyumayan API error ${res.status}: ${await res.text()}`);
    }
    return { data: (await res.json()) as T, etag: res.headers.get("etag"), requestId: res.headers.get("x-request-id") };
  }

  version() { return this.request("/api/public/version"); }
  bootstrap(locale = "zh-TW") { return this.request(`/api/public/knowledge/bootstrap?locale=${encodeURIComponent(locale)}`); }
  search(q: string, limit = 20, cursor?: string) { return this.request(`/api/public/knowledge/search?q=${encodeURIComponent(q)}&limit=${limit}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`); }
  vocabulary(params: { dialectCode?: string; limit?: number; cursor?: string } = {}) {
    const qs = new URLSearchParams();
    if (params.dialectCode) qs.set("dialectCode", params.dialectCode);
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.cursor) qs.set("cursor", params.cursor);
    return this.request(`/api/public/knowledge/vocabulary?${qs.toString()}`);
  }
  latestExport(type = "main_site_bootstrap") { return this.request(`/api/public/knowledge/export/latest?type=${encodeURIComponent(type)}`); }
  replaySync(body: { since?: string; until?: string }) {
    return this.request("/api/internal/main-site/sync/replay", { internal: true, method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  }
  enqueueExport(bundleType = "main_site_bootstrap") {
    return this.request("/api/internal/exports/bundle/enqueue", { internal: true, method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ bundleType }) });
  }
}
