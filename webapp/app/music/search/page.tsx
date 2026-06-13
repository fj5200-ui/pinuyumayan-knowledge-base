import { createTtsSttMusicClientV44 } from "../../../../frontend-sdk/ttsSttMusicClient.v44";
import { createTtsSttMusicClientV47 } from "../../../../frontend-sdk/ttsSttMusicClient.v47";

const API_BASE = process.env.NEXT_PUBLIC_PINUYUMAYAN_API_BASE_URL ?? "http://localhost:8787";

export const metadata = {
  title: "卑南族音樂搜尋｜Pinuyumayan",
  description: "搜尋卑南族歌謠、歌曲與權威來源 metadata。未審核內容僅顯示摘要，不提供完整歌詞或音訊下載。",
  openGraph: { title: "卑南族音樂搜尋｜Pinuyumayan", description: "MySQL FULLTEXT + v45 synonyms/facets/suggestions + v47 wired observability and polished experience layer。", type: "website" },
};

export default async function MusicSearchPage({ searchParams }: { searchParams?: { q?: string; [key: string]: string | undefined } }) {
  const q = searchParams?.q ?? "";
  const client = createTtsSttMusicClientV44({ baseUrl: API_BASE });
  const v47 = createTtsSttMusicClientV47({ baseUrl: API_BASE });
  const [data, experience] = await Promise.all([client.searchMusic(q, { limit: "20" }), v47.sitePolish().catch(() => null)]);
  const hits = data.hits ?? [];
  const facetCounts = data.facet_counts ?? {};
  const recommended = experience?.recommended_queries ?? ["卑南族 歌謠", "南王 卑南族", "知本 卑南族 音樂", "Samingad", "Sangpuy", "陳建年 金曲獎"];
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 text-zinc-950 dark:text-zinc-50">
      <section className="rounded-3xl border border-zinc-200 bg-white/95 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">Music Search v47 polished experience layer</p>
        <h1 className="text-3xl font-semibold">卑南族歌謠／歌曲 metadata 搜尋</h1>
        <p className="mt-3 text-zinc-800 dark:text-zinc-200">MySQL FULLTEXT 優先查詢，加入 synonym / romanization、facet count、空結果建議與 v47 實接 query log 與搜尋觀測；未審核候選只公開 metadata 摘要。</p>
        <form className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input name="q" defaultValue={q} className="min-w-0 flex-1 rounded-xl border border-zinc-400 bg-white px-4 py-3 text-zinc-950 placeholder:text-zinc-500 focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-red-900" placeholder="搜尋歌謠、人物、部落、來源..." />
          <button className="rounded-xl bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800">搜尋</button>
        </form>
        <div className="mt-4 text-xs text-zinc-700 dark:text-zinc-300">mode: {data.mode}｜quality: {data.quality_mode ?? "v44-db"}｜observability: {data.observability_mode ?? "v47_query_log_wired"}</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {recommended.map((item: string) => <a key={item} href={`/music/search?q=${encodeURIComponent(item)}`} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-900 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-100">{item}</a>)}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[260px,1fr]">
        <aside className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="font-semibold">篩選 facets</h2>
          <FacetGroup title="來源權威" values={facetCounts.source_authority} />
          <FacetGroup title="作品類型" values={facetCounts.work_type} />
          <FacetGroup title="權利狀態" values={facetCounts.rights_status} />
          <FacetGroup title="敏感分級" values={facetCounts.sensitivity} />
          <p className="rounded-xl border border-yellow-300 bg-yellow-50 p-3 text-xs leading-5 text-yellow-950 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100">安全提示：metadata-only：本搜尋只提供 metadata，不提供完整歌詞、不提供音訊下載。</p>
        </aside>
        <div className="space-y-3">
          {hits.length === 0 && (data.zero_result_suggestions ?? []).length > 0 ? <section className="rounded-2xl border border-yellow-300 bg-yellow-50 p-5 text-yellow-950 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100"><h2 className="font-semibold">找不到結果，建議搜尋：</h2><div className="mt-3 flex flex-wrap gap-2">{data.zero_result_suggestions.map((s: string) => <a key={s} href={`/music/search?q=${encodeURIComponent(s)}`} className="rounded-full bg-white px-3 py-1 text-sm font-medium text-yellow-950 ring-1 ring-yellow-300 dark:bg-yellow-900 dark:text-yellow-50 dark:ring-yellow-700">{s}</a>)}</div></section> : null}
          {hits.map((hit: any) => (
            <article key={hit.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-xl font-semibold"><a href={`/music/${encodeURIComponent(hit.id)}`} className="hover:text-red-700 dark:hover:text-red-300">{hit.title}</a></h2>
              <p className="mt-2 text-sm leading-6 text-zinc-800 dark:text-zinc-200">{hit.body ?? hit.summary}</p>
              <div className="mt-3 text-xs text-zinc-700 dark:text-zinc-300">rights: {hit.metadata?.rights_status ?? hit.facets?.rights_status ?? "metadata_only"}｜score: {hit.metadata?.score ?? "static"}</div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
function FacetGroup({ title, values }: { title: string; values?: Record<string, number> }) {
  const entries = Object.entries(values ?? {}).filter(([, count]) => Number(count) > 0).slice(0, 8);
  return <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"><h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</h3>{entries.length ? <div className="mt-2 flex flex-wrap gap-2">{entries.map(([key, count]) => <span key={key} className="rounded-full bg-white px-2 py-1 text-xs text-zinc-800 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:text-zinc-200 dark:ring-zinc-700">{key} · {count}</span>)}</div> : <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">尚無 facet count</p>}</div>;
}
