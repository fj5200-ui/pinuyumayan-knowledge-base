'use client';

import { useState } from 'react';
import { createFrontendAiArticleClient } from '../../frontend-sdk/pinuyumayanFrontendAiArticleClient.v19';

export function FrontendAiArticleComposer({ baseUrl, internalApiKey }: { baseUrl: string; internalApiKey: string }) {
  const [idea, setIdea] = useState('');
  const [result, setResult] = useState<unknown>(null);
  const client = createFrontendAiArticleClient({ baseUrl, internalApiKey });

  async function validateOnly() {
    // 前端可在這裡呼叫自己的 AI provider；範例只示範送回後端做檢查。
    const draft = {
      title_zh: '草稿標題',
      slug: `draft-${Date.now()}`,
      body_markdown: idea,
      claim_ids: [],
      source_ids: [],
      user_idea_summary: idea.slice(0, 120),
    };
    const validation = await client.validateClientDraft(draft);
    setResult(validation);
  }

  return (
    <section className="rounded-xl border p-4 space-y-3">
      <h2 className="text-lg font-semibold">前端 AI 文章 Composer</h2>
      <p className="text-sm opacity-75">文章由前端調用 AI；後端只做來源、去重、敏感內容與審核檢查。</p>
      <textarea className="w-full rounded border p-2" rows={8} value={idea} onChange={(e) => setIdea(e.target.value)} />
      <button className="rounded border px-3 py-2" onClick={validateOnly}>送後端檢查</button>
      <pre className="overflow-auto text-xs">{JSON.stringify(result, null, 2)}</pre>
    </section>
  );
}
