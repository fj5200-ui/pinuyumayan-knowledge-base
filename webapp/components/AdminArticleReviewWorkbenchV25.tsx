"use client";
import { useEffect, useState } from "react";

export function AdminArticleReviewWorkbenchV25() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch(`${process.env.NEXT_PUBLIC_KB_API_URL}/api/admin/articles/v25/review-workbench`).then(r => r.json()).then(setData); }, []);
  return (
    <section className="rounded-xl border p-4 shadow-sm">
      <h2 className="text-xl font-semibold">文章審核工作台 v25</h2>
      <p className="text-sm opacity-75">顯示引用、去重、卑南遺址禁止關聯、敏感內容、SEO 與冷卻檢查。</p>
      <pre className="mt-4 overflow-auto rounded bg-black/5 p-3 text-xs">{JSON.stringify(data, null, 2)}</pre>
    </section>
  );
}
