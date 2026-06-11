export type SourcePacket = {
  packet_id: string;
  title_zh: string;
  claim_ids: string[];
  source_ids: string[];
};

export type AiProviderAdapter = {
  generateArticle(input: {
    userIdea: string;
    blueprintId?: string;
    sourceClaims: unknown[];
    rules: unknown;
  }): Promise<{
    title_zh: string;
    slug: string;
    body_markdown: string;
    claim_ids: string[];
    source_ids: string[];
    user_idea_summary: string;
  }>;
};

export function createFrontendAiArticleClient(options: {
  baseUrl: string;
  internalApiKey?: string;
}) {
  const baseUrl = options.baseUrl.replace(/\/$/, '');
  const headers = options.internalApiKey ? { 'x-pinuyumayan-main-site-key': options.internalApiKey } : {};

  return {
    async getComposerConfig() {
      const res = await fetch(`${baseUrl}/api/public/ai-article/frontend-composer-config`);
      if (!res.ok) throw new Error(`composer config failed: ${res.status}`);
      return res.json();
    },

    async resolveSourcePack(claimIds: string[]) {
      const res = await fetch(`${baseUrl}/api/internal/ai-article/source-pack/resolve`, {
        method: 'POST',
        headers: { ...headers, 'content-type': 'application/json' },
        body: JSON.stringify({ claimIds }),
      });
      if (!res.ok) throw new Error(`source pack resolve failed: ${res.status}`);
      return res.json();
    },

    async validateClientDraft(draft: unknown) {
      const res = await fetch(`${baseUrl}/api/internal/ai-article/client-draft/validate`, {
        method: 'POST',
        headers: { ...headers, 'content-type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error(`draft validation failed: ${res.status}`);
      return res.json();
    },

    async submitReview(draft: unknown) {
      const res = await fetch(`${baseUrl}/api/internal/ai-article/client-draft/submit-review`, {
        method: 'POST',
        headers: { ...headers, 'content-type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error(`submit review failed: ${res.status}`);
      return res.json();
    },

    async composeWithFrontendProvider(adapter: AiProviderAdapter, input: { userIdea: string; claimIds: string[]; blueprintId?: string }) {
      const sourcePack = await this.resolveSourcePack(input.claimIds);
      const config = await this.getComposerConfig();
      const draft = await adapter.generateArticle({
        userIdea: input.userIdea,
        blueprintId: input.blueprintId,
        sourceClaims: sourcePack.data?.claims || [],
        rules: config.data,
      });
      const validation = await this.validateClientDraft(draft);
      return { draft, validation };
    },
  };
}
