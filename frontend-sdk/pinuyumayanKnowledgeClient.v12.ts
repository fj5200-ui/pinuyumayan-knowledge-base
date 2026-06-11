export interface PinuyumayanKnowledgeClientOptionsV12 {
  baseUrl: string;
  apiKey?: string;
  previewToken?: string;
  fetchImpl?: typeof fetch;
}

export class PinuyumayanKnowledgeClientV12 {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly previewToken?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: PinuyumayanKnowledgeClientOptionsV12) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
    this.previewToken = options.previewToken;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private headers(extra?: Record<string, string>): HeadersInit {
    return {
      ...(this.apiKey ? { "x-pinuyumayan-main-site-key": this.apiKey } : {}),
      ...(this.previewToken ? { "x-pinuyumayan-preview-token": this.previewToken } : {}),
      ...(extra ?? {})
    };
  }

  async bootstrap(channel = "public") {
    const res = await this.fetchImpl(`${this.baseUrl}/api/public/knowledge/bootstrap?channel=${encodeURIComponent(channel)}`, { headers: this.headers() });
    if (!res.ok) throw new Error(`bootstrap failed: ${res.status}`);
    return res.json();
  }

  async vocabulary(params: { dialectCode?: string; limit?: number; cursor?: string; channel?: string } = {}) {
    const qs = new URLSearchParams();
    if (params.dialectCode) qs.set("dialectCode", params.dialectCode);
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.cursor) qs.set("cursor", params.cursor);
    if (params.channel) qs.set("channel", params.channel);
    const res = await this.fetchImpl(`${this.baseUrl}/api/public/knowledge/vocabulary?${qs}`, { headers: this.headers() });
    if (!res.ok) throw new Error(`vocabulary failed: ${res.status}`);
    return res.json();
  }

  async exportLatest(channel = "public") {
    const res = await this.fetchImpl(`${this.baseUrl}/api/public/knowledge/export/latest?channel=${encodeURIComponent(channel)}`, { headers: this.headers() });
    if (!res.ok) throw new Error(`exportLatest failed: ${res.status}`);
    return res.json();
  }

  async releaseChannels() {
    const res = await this.fetchImpl(`${this.baseUrl}/api/public/release-channels`, { headers: this.headers() });
    if (!res.ok) throw new Error(`releaseChannels failed: ${res.status}`);
    return res.json();
  }

  async governanceDashboard() {
    const res = await this.fetchImpl(`${this.baseUrl}/api/ops/governance-dashboard`, { headers: this.headers() });
    if (!res.ok) throw new Error(`governanceDashboard failed: ${res.status}`);
    return res.json();
  }
}

