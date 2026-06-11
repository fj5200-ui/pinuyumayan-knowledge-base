export interface PronunciationClientOptions {
  baseUrl: string;
  apiKey?: string;
}

export class PuyumaPronunciationClientV16 {
  constructor(private options: PronunciationClientOptions) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    if (this.options.apiKey) headers.set("x-pinuyumayan-main-site-key", this.options.apiKey);
    const res = await fetch(`${this.options.baseUrl}${path}`, { ...init, headers });
    if (!res.ok) throw new Error(`Pronunciation API failed: ${res.status}`);
    const json = await res.json();
    return json.data as T;
  }

  getPronunciation(entryId: string) {
    return this.request(`/api/public/pronunciation/${encodeURIComponent(entryId)}`);
  }

  pronounce(params: { text?: string; entryId?: string; dialectCode?: string }) {
    const query = new URLSearchParams();
    if (params.text) query.set("text", params.text);
    if (params.entryId) query.set("entryId", params.entryId);
    if (params.dialectCode) query.set("dialectCode", params.dialectCode);
    return this.request(`/api/public/tts/pronounce?${query.toString()}`);
  }

  listModels() {
    return this.request(`/api/admin/tts/models`);
  }
}
