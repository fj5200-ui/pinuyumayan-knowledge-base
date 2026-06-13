"use client";
import { useEffect, useState } from "react";
import { createTtsSttMusicClientV45 } from "../../frontend-sdk/ttsSttMusicClient.v45";

type ReviewState = { workflow?: any; quality?: any; worker?: any; governance?: any; seo?: any; preflight?: any; center?: any; error?: string };

export function MusicSpeechReviewCenterV45({ baseUrl }: { baseUrl: string }) {
  const [data, setData] = useState<ReviewState | null>(null);
  useEffect(() => {
    const client = createTtsSttMusicClientV45({ baseUrl });
    Promise.all([client.reviewWorkflow(), client.searchQuality(), client.authorityFetchWorker(), client.governanceReport(), client.sitemapContract(), client.vpsPreflight(), client.reviewCenter()])
      .then(([workflow, quality, worker, governance, seo, preflight, center]) => setData({ workflow, quality, worker, governance, seo, preflight, center }))
      .catch((error) => setData({ error: String(error) }));
  }, [baseUrl]);
  if (!data) return <section className="rounded-xl border p-4">載入 v45 production review center...</section>;
  if (data.error) return <pre className="rounded-xl border p-4 text-red-700">{data.error}</pre>;
  const summary = data.workflow?.summary ?? {};
  const panels = data.center?.panels ?? [];
  return (
    <section className="space-y-4 rounded-2xl border bg-white p-6 text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-zinc-50">
      <div>
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">v45 Music + Speech Production Review Center</p>
        <h2 className="text-2xl font-semibold">正式審核、搜尋品質、來源 worker、SEO 與 VPS preflight</h2>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">所有寫入動作走 HMAC internal route；未完成授權、speaker consent、alignment、native speaker review 前，公開 TTS/STT 與音訊訓練維持關閉。</p>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Review assets" value={summary.total_assets ?? 0} />
        <Metric label="Pending" value={summary.pending_human_review ?? 0} />
        <Metric label="Search tests" value={data.quality?.report?.tests?.length ?? 0} />
        <Metric label="Sitemap URLs" value={data.seo?.report?.url_count ?? 0} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {panels.map((panel: any) => <article key={panel.key} className="rounded-xl border bg-zinc-50 p-4 dark:bg-zinc-900"><h3 className="font-semibold">{panel.title}</h3><code className="mt-2 block break-all text-xs text-zinc-600 dark:text-zinc-300">{panel.endpoint}</code></article>)}
      </div>
      <details className="rounded-xl border p-4"><summary className="cursor-pointer font-medium">v45 production contracts</summary><pre className="mt-3 max-h-[520px] overflow-auto text-xs">{JSON.stringify({ workflow: data.workflow?.summary, quality: data.quality?.report, worker: data.worker?.dry_run, governance: data.governance?.report, preflight: data.preflight }, null, 2)}</pre></details>
    </section>
  );
}
function Metric({ label, value }: { label: string; value: string | number }) { return <div className="rounded-xl border bg-zinc-50 p-4 dark:bg-zinc-900"><div className="text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">{label}</div><div className="mt-1 text-2xl font-semibold">{value}</div></div>; }
