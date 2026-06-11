import React, { useMemo, useState } from 'react';
import { mockComposeFromClaims } from '../../frontend-sdk/frontendAiComposerClient.v22';

type Claim = { claim_id: string; statement_zh: string; source_ids: string[] };

export function FrontendAiComposerV22({ claims }: { claims: Claim[] }) {
  const [idea, setIdea] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [draft, setDraft] = useState<{ title: string; bodyMarkdown: string } | null>(null);
  const selectedClaims = useMemo(() => claims.filter((c) => selected.includes(c.claim_id)), [claims, selected]);

  async function compose() {
    const next = await mockComposeFromClaims({ userIdea: idea, claimSummaries: selectedClaims.map((c) => c.statement_zh) });
    setDraft({ title: next.title, bodyMarkdown: next.bodyMarkdown });
  }

  return (
    <section className="rounded-2xl border p-4 shadow-sm">
      <h2 className="text-xl font-semibold">前端 AI Composer v22</h2>
      <p className="text-sm opacity-70">文章由主站前端／server route 產生；後端知識庫只做史料包、引用、去重與敏感檢查。</p>
      <textarea className="mt-3 min-h-24 w-full rounded-xl border p-3" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="輸入你的想法，不要寫成未查證史實" />
      <div className="mt-3 grid gap-2">
        {claims.slice(0, 8).map((c) => (
          <label key={c.claim_id} className="flex gap-2 rounded-xl border p-2 text-sm">
            <input type="checkbox" checked={selected.includes(c.claim_id)} onChange={(e) => setSelected((old) => e.target.checked ? [...old, c.claim_id] : old.filter((id) => id !== c.claim_id))} />
            <span>{c.statement_zh}</span>
          </label>
        ))}
      </div>
      <button className="mt-3 rounded-xl border px-4 py-2" onClick={compose}>產生草稿並送後端檢查</button>
      {draft && <pre className="mt-4 overflow-auto rounded-xl bg-black/5 p-3 text-sm whitespace-pre-wrap">{draft.bodyMarkdown}</pre>}
    </section>
  );
}
