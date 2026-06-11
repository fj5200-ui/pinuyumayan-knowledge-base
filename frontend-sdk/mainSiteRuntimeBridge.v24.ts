export type MainSiteRuntimeBridgeConfig = { baseUrl: string };

export function createMainSiteRuntimeBridgeV24(config: MainSiteRuntimeBridgeConfig) {
  const base = config.baseUrl.replace(/\/$/, "");
  return {
    async publicConfig() {
      const res = await fetch(`${base}/api/public/main-site-connection/config`);
      if (!res.ok) throw new Error(`config failed ${res.status}`);
      return res.json();
    },
    async connectionCheck() {
      const res = await fetch(`${base}/api/ops/main-site/v24/connection-check`);
      if (!res.ok) throw new Error(`connection check failed ${res.status}`);
      return res.json();
    },
    async validateDraft(draft: unknown) {
      throw new Error("Use main-site server route with HMAC; do not call internal validation from browser.");
    }
  };
}
