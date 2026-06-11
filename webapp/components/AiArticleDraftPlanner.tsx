"use client";

import { useState } from "react";
import { createPinuyumayanAiArticleClient } from "../../frontend-sdk/pinuyumayanAiArticleClient.v18";

export function AiArticleDraftPlanner({ baseUrl, internalApiKey }: { baseUrl: string; internalApiKey: string }) {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<any>(null);
  const client = createPinuyumayanAiArticleClient({ baseUrl, internalApiKey });
  async function build() {
    const draft = await client.buildDraftPlan({ blueprintId: "article_bp_ritual_calendar_summary", idea });
    setResult(draft);
  }
  return (
    <section className="rounded-xl border p-4 space-y-3">
      <h2 className="text-lg font-semibold">AI 發文草稿規劃器</h2>
      <p className="text-sm opacity-80">AI 只使用 verified source claims + 你的想法產生草稿規劃；發布前仍需去重與人工審核。</p>
      <textarea className="w-full rounded-md border p-2" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="輸入你的發文想法，不要輸入未確認史料。" />
      <button className="rounded-md border px-3 py-2" onClick={build}>建立草稿規劃</button>
      {result && <pre className="overflow-auto rounded-md bg-black/5 p-3 text-xs">{JSON.stringify(result, null, 2)}</pre>}
    </section>
  );
}
