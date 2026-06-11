export type MainSiteConnectionStatus = {
  version: "v23";
  publicApi: string[];
  internalApi: string[];
  requiredHeaders: string[];
  aiGenerationLocation: "main_site_server_route";
  backendRole: "source_packets_and_governance_only";
};

export function getMainSiteConnectionStatus(): MainSiteConnectionStatus {
  return {
    version: "v23",
    publicApi: [
      "/api/public/knowledge/bootstrap",
      "/api/public/knowledge/search",
      "/api/public/knowledge/vocabulary",
      "/api/public/audio/manifest",
      "/api/public/ai-article/frontend-composer-config",
      "/api/public/knowledge/forbidden-relations/v21"
    ],
    internalApi: [
      "/api/internal/ai-article/client-draft/validate",
      "/api/internal/ai-article/client-draft/submit-review",
      "/api/internal/main-site/knowledge/delta",
      "/api/internal/main-site/knowledge/bundle"
    ],
    requiredHeaders: [
      "x-pinuyumayan-main-site-key",
      "x-pinuyumayan-client-id",
      "x-pinuyumayan-timestamp",
      "x-pinuyumayan-nonce",
      "x-pinuyumayan-signature"
    ],
    aiGenerationLocation: "main_site_server_route",
    backendRole: "source_packets_and_governance_only"
  };
}
