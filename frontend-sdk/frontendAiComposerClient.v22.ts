export type FrontendAiProviderId = 'local_mock_adapter' | 'openai_responses_adapter' | 'kimi_chat_adapter';

export type ComposerClientOptions = {
  knowledgeBaseUrl: string;
  internalApiKey?: string;
};

export function createFrontendAiComposerClientV22(options: ComposerClientOptions) {
  const base = options.knowledgeBaseUrl.replace(/\/$/, '');
  async function getProviderAdapters() {
    const res = await fetch(`${base}/api/public/ai-article/v22/provider-adapters`);
    if (!res.ok) throw new Error(`provider adapters failed: ${res.status}`);
    return res.json();
  }
  async function getSourcePackets() {
    const res = await fetch(`${base}/api/public/ai-article/v22/source-packets`);
    if (!res.ok) throw new Error(`source packets failed: ${res.status}`);
    return res.json();
  }
  async function validateClientDraft(payload: unknown) {
    const res = await fetch(`${base}/api/internal/ai-article/v22/client-draft/validate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(options.internalApiKey ? { 'x-pinuyumayan-main-site-key': options.internalApiKey } : {}) },
      body: JSON.stringify(payload)
    });
    return res.json();
  }
  return { getProviderAdapters, getSourcePackets, validateClientDraft };
}

export async function mockComposeFromClaims(input: { userIdea: string; titleHint?: string; claimSummaries: string[] }) {
  return {
    title: input.titleHint || '卑南族文化公開摘要草稿',
    summary: input.userIdea,
    bodyMarkdown: [`# ${input.titleHint || '卑南族文化公開摘要草稿'}`, '', input.userIdea, '', ...input.claimSummaries.map((s) => `- ${s}`)].join('\n')
  };
}
