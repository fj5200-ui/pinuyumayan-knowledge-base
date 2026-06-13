"use client";
import { useEffect, useMemo, useState } from "react";
import { createTtsSttMusicClientV47 } from "../../frontend-sdk/ttsSttMusicClient.v47";

type State = { ui?: any; tests?: any; search?: any; authority?: any; governance?: any; site?: any; center?: any; preflight?: any; error?: string };

export function MusicSpeechReviewCenterV47({ baseUrl }: { baseUrl: string }) {
  const [data, setData] = useState<State | null>(null);
  const [action, setAction] = useState("assign_reviewer");
  useEffect(() => {
    const client = createTtsSttMusicClientV47({ baseUrl });
    Promise.all([client.reviewActionUi(), client.transactionTests(), client.searchObservability(), client.authorityAdapters(), client.modelGovernanceReport(), client.sitePolish(), client.reviewCenter(), client.vpsPreflight()])
      .then(([ui, tests, search, authority, governance, site, center, preflight]) => setData({ ui, tests, search, authority, governance, site, center, preflight }))
      .catch((error) => setData({ error: String(error) }));
  }, [baseUrl]);
  const first = useMemo(() => data?.ui?.items?.[0], [data]);
  if (!data) return <section className="rounded-xl border border-zinc-200 bg-white p-4 text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">載入 v47 可操作審核中心...</section>;
  if (data.error) return <pre className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">{data.error}</pre>;
  const panels = data.center?.panels ?? [];
  const summary = data.ui?.summary ?? {};
  return (
    <section className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-6 text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
      <div>
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">v47 Music + Speech Operational Review Center</p>
        <h2 className="text-2xl font-semibold">可操作審核 UI、交易測試、搜尋觀測、來源採集、模型治理、主站美化</h2>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">v47 將 v46 contract 推進到可操作表單與 MySQL transaction 驗收；公開釋出、批次核准與權威來源自動公開仍預設關閉。</p>
      </div>
      <div className="grid gap-3 md:grid-cols-6">
        <Metric label="Queue rows" value={summary.total_rows ?? 0} />
        <Metric label="DB tests" value={data.tests?.test_cases?.length ?? 0} />
        <Metric label="Query logs" value={data.search?.sample_logs?.length ?? 0} />
        <Metric label="Adapters" value={data.authority?.adapters?.length ?? 0} />
        <Metric label="Experiments" value={data.governance?.trends?.length ?? 0} />
        <Metric label="Open" value={summary.public_release_allowed ? "yes" : "blocked"} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr,360px]">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-semibold">審核操作表單預覽</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-sm">Action<select value={action} onChange={(e) => setAction(e.target.value)} className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50">{Object.keys(data.ui?.form_schemas ?? {}).map((key) => <option key={key}>{key}</option>)}</select></label>
            <label className="text-sm">Queue ID<input readOnly value={first?.queue_id ?? ""} className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50" /></label>
            <label className="text-sm">Asset ID<input readOnly value={first?.asset_id ?? ""} className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50" /></label>
            <label className="text-sm">Reviewer / Actor<input placeholder="reviewer-id" className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50" /></label>
          </div>
          <p className="mt-3 rounded-xl border border-yellow-300 bg-yellow-50 p-3 text-xs leading-5 text-yellow-950 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100">正式送出時需後端 HMAC 與 v47 nonce；前端不可保存 secret。Approve 必須附 evidence_attachment_ids，且 public release 仍為 false。</p>
          <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-white p-3 text-xs dark:bg-zinc-950">{JSON.stringify({ action, required_fields: data.ui?.form_schemas?.[action], nonce: data.ui?.hmac_nonce_bridge }, null, 2)}</pre>
        </div>
        <div className="space-y-3">
          {panels.map((panel: any) => <article key={panel.key} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"><h3 className="font-semibold">{panel.title}</h3><code className="mt-2 block break-all text-xs text-zinc-700 dark:text-zinc-300">{panel.endpoint}</code></article>)}
        </div>
      </div>
      <details className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"><summary className="cursor-pointer font-medium">v47 contracts snapshot</summary><pre className="mt-3 max-h-[520px] overflow-auto text-xs">{JSON.stringify({ tests: data.tests?.test_cases, search: data.search?.metrics, authority: data.authority?.adapters, governance: data.governance?.summary, site: data.site?.day_mode_tokens, preflight: data.preflight }, null, 2)}</pre></details>
    </section>
  );
}
function Metric({ label, value }: { label: string; value: string | number }) { return <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"><div className="text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">{label}</div><div className="mt-1 text-2xl font-semibold">{value}</div></div>; }
