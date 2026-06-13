"use client";
import { useEffect, useState } from "react";
import { createTtsSttMusicClientV46 } from "../../frontend-sdk/ttsSttMusicClient.v46";

type State = { queue?: any; obs?: any; authority?: any; experiments?: any; site?: any; center?: any; preflight?: any; error?: string };

export function MusicSpeechReviewCenterV46({ baseUrl }: { baseUrl: string }) {
  const [data, setData] = useState<State | null>(null);
  useEffect(() => {
    const client = createTtsSttMusicClientV46({ baseUrl });
    Promise.all([client.reviewerQueue(), client.searchObservability(), client.authorityGovernance(), client.experimentRegistry(), client.siteExperience(), client.reviewCenter(), client.vpsPreflight()])
      .then(([queue, obs, authority, experiments, site, center, preflight]) => setData({ queue, obs, authority, experiments, site, center, preflight }))
      .catch((error) => setData({ error: String(error) }));
  }, [baseUrl]);
  if (!data) return <section className="rounded-xl border border-zinc-200 bg-white p-4 text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">載入 v46 production control center...</section>;
  if (data.error) return <pre className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">{data.error}</pre>;
  const summary = data.queue?.queue?.summary ?? {};
  const panels = data.center?.panels ?? [];
  return (
    <section className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-6 text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
      <div>
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">v46 Music + Speech Production Control Center</p>
        <h2 className="text-2xl font-semibold">審核隊列、MySQL transaction、搜尋觀測、來源治理、模型 registry、主站體驗</h2>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">v46 開始把寫入路徑改成可用 MySQL transaction commit/rollback；沒有 DATABASE_URL 時仍只回傳 contract-only，公開釋出維持關閉。</p>
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        <Metric label="Queue assets" value={summary.total_queue_items ?? 0} />
        <Metric label="Waiting" value={summary.waiting_assignment ?? 0} />
        <Metric label="Search samples" value={data.obs?.report?.tests?.length ?? 0} />
        <Metric label="Source policies" value={data.authority?.report?.policy_count ?? 0} />
        <Metric label="Experiments" value={data.experiments?.report?.experiment_count ?? 0} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {panels.map((panel: any) => <article key={panel.key} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"><h3 className="font-semibold">{panel.title}</h3><code className="mt-2 block break-all text-xs text-zinc-700 dark:text-zinc-300">{panel.endpoint}</code></article>)}
      </div>
      <details className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"><summary className="cursor-pointer font-medium">v46 contracts snapshot</summary><pre className="mt-3 max-h-[520px] overflow-auto text-xs">{JSON.stringify({ queue: data.queue?.queue?.summary, transaction: data.queue?.transaction_contract?.transaction_semantics, observability: data.obs?.report, authority: data.authority?.report, experiments: data.experiments?.report, site: data.site?.report, preflight: data.preflight }, null, 2)}</pre></details>
    </section>
  );
}
function Metric({ label, value }: { label: string; value: string | number }) { return <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"><div className="text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">{label}</div><div className="mt-1 text-2xl font-semibold">{value}</div></div>; }
