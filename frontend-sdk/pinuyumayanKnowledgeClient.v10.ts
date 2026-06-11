export type KnowledgeClientConfig = {
  baseUrl: string;
  apiKey?: string;
  fetchImpl?: typeof fetch;
};

export class PinuyumayanKnowledgeClientV10 {
  private fetchImpl: typeof fetch;
  constructor(private config: KnowledgeClientConfig) {
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("accept", "application/json");
    if (this.config.apiKey) headers.set("x-pinuyumayan-main-site-key", this.config.apiKey);
    const res = await this.fetchImpl(`${this.config.baseUrl}${path}`, { ...init, headers });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.ok === false) {
      const err = json?.error ?? { code: "HTTP_ERROR", message: `HTTP ${res.status}` };
      throw new Error(`${err.code}: ${err.message}`);
    }
    return (json?.data ?? json) as T;
  }

  readiness() {
    return this.request<{ ready: boolean; checks: Record<string, unknown> }>("/ready");
  }

  bootstrap(locale = "zh-TW") {
    return this.request(`/api/public/knowledge/bootstrap?locale=${encodeURIComponent(locale)}`);
  }

  vocabulary(params: { dialectCode?: string; q?: string; limit?: number; cursor?: string } = {}) {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value !== undefined) qs.set(key, String(value));
    return this.request(`/api/public/knowledge/vocabulary?${qs.toString()}`);
  }

  enqueueFullCorpusImport(minEntries = 1000) {
    return this.request(`/api/internal/jobs/full-corpus/enqueue`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ minEntries })
    });
  }
}
