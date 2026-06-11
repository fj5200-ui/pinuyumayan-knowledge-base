"use client";
import { useEffect, useState } from "react";

export function AdminArticleReviewWorkbenchV24() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/admin/articles/review-workbench").then(r => r.json()).then(setData).catch(err => setData({ error: err.message }));
  }, []);
  return (
    <section className="rounded-xl border p-4">
      <h2 className="text-xl font-semibold">文章審核工作台 v24</h2>
      <p className="text-sm opacity-70">顯示引用、去重、敏感、授權、卑南遺址禁止關聯與排程狀態。</p>
      <pre className="mt-3 overflow-auto rounded bg-neutral-100 p-3 text-xs">{JSON.stringify(data, null, 2)}</pre>
    </section>
  );
}
