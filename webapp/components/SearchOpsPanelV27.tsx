"use client";
import { useEffect, useState } from "react";

export function SearchOpsPanelV27({ apiBase = "" }: { apiBase?: string }) {
  const [state, setState] = useState<any>(null);
  useEffect(() => { fetch(`${apiBase}/api/ops/search/v27/index-status`).then(r=>r.json()).then(setState).catch(e=>setState({ ok:false, error:String(e) })); }, [apiBase]);
  return <section className="rounded-xl border p-4">
    <h2 className="text-lg font-semibold">搜尋索引 v27</h2>
    <p className="text-sm">Adapter：{state?.data?.adapter ?? "mysql_fulltext"}</p>
    <pre className="mt-2 max-h-72 overflow-auto rounded bg-neutral-100 p-3 text-xs">{JSON.stringify(state?.data ?? state, null, 2)}</pre>
  </section>;
}
