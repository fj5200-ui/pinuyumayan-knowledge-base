export default function MusicSpeechReviewCenterV55() {
  const cards = [
    { title: "Release certificate 實簽包", text: "PDF/JSON 證書、Cloudflare/DNS、backup restore、rollback、30 分鐘觀測與三方簽核證據。" },
    { title: "20 筆合法語音解封", text: "真實 license、speaker consent、alignment、native speaker review 未上傳前仍維持 blocked。" },
    { title: "搜尋 100% rollout", text: "LTR、錯字容忍、intent routing 可依實測升到 100%，並保留 5 分鐘 rollback。" },
    { title: "metadata 發布 / 撤稿演練", text: "metadata-only 卡片公開、搜尋索引、sitemap/OG、source drift 與 takedown rehearsal。" },
    { title: "模型治理封存中心", text: "水印 PDF、lineage DAG、版本差異、簽核章、blocker closure 與審計下載。" },
    { title: "營運監控 SOP", text: "每日/每週報告、uptime、CWV、Lighthouse、OG、sitemap、錯誤率與告警路由。" }
  ];
  return <section className="space-y-6 rounded-3xl border border-red-200 bg-white p-6 text-slate-950 shadow-sm dark:border-red-900/50 dark:bg-slate-950 dark:text-slate-50">
    <div><p className="text-sm font-semibold text-red-700 dark:text-red-300">Pinuyumayan v55</p><h1 className="text-3xl font-bold">Formal Release / Legal Speech / Operations Governance Center</h1><p className="mt-2 text-slate-700 dark:text-slate-300">把 v54 的正式封板結構推進到實簽包、合法資料解封、搜尋 100% rollout、metadata 發布撤稿、治理封存與營運 SOP。</p></div>
    <div className="grid gap-4 md:grid-cols-2">{cards.map((card) => <article key={card.title} className="rounded-2xl border border-slate-200 bg-amber-50/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><h2 className="font-semibold">{card.title}</h2><p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{card.text}</p></article>)}</div>
  </section>;
}
