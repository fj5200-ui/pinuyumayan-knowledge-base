"use client";
import { useState } from "react";

export function ArticleComposerV24() {
  const [blueprintId, setBlueprintId] = useState("pinuyumayan-name-boundary");
  const [userIdea, setUserIdea] = useState("");
  const [result, setResult] = useState<any>(null);

  async function compose() {
    const res = await fetch("/api/ai/compose", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ blueprintId, userIdea })
    });
    setResult(await res.json());
  }

  return (
    <section className="rounded-xl border p-4 space-y-3">
      <h2 className="text-xl font-semibold">AI 文章草稿</h2>
      <p className="text-sm opacity-70">文章由主站 server route 調用 AI；後端知識庫只做史料包與發布前檢查。</p>
      <input className="w-full rounded border p-2" value={blueprintId} onChange={(e)=>setBlueprintId(e.target.value)} />
      <textarea className="w-full rounded border p-2 min-h-32" value={userIdea} onChange={(e)=>setUserIdea(e.target.value)} placeholder="輸入你的想法，不能直接當史實。" />
      <button className="rounded bg-black px-4 py-2 text-white" onClick={compose}>產生草稿並檢查</button>
      {result && <pre className="overflow-auto rounded bg-neutral-100 p-3 text-xs">{JSON.stringify(result, null, 2)}</pre>}
    </section>
  );
}
