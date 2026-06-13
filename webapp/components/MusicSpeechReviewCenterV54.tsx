export default function MusicSpeechReviewCenterV54() {
  const cards = [
    { title: "正式發布封板", text: "release certificate、DNS/Cloudflare、backup restore、rollback、30 分鐘觀測與三方簽核。" },
    { title: "合法語音資料解封", text: "20 筆候選資料建立 dataset version；未上傳真實 evidence 前維持 blocked。" },
    { title: "搜尋排序正式切換", text: "LTR、typo tolerance、intent routing 支援 50% / 100% rollout 與一鍵 rollback。" },
    { title: "metadata 全站公開", text: "metadata-only 卡片進入主站、搜尋索引、sitemap、OG，保留 no audio/no lyrics guard。" },
    { title: "模型治理報告封存", text: "水印 PDF、lineage DAG、版本差異、簽核章與 blocker closure 封存。" },
    { title: "營運監控自動化", text: "uptime、CWV、Lighthouse、OG、sitemap、錯誤率每日/每週報告與告警。" }
  ];
  return <section className="space-y-6 rounded-3xl border border-red-200 bg-white p-6 text-slate-950 shadow-sm dark:border-red-900/50 dark:bg-slate-950 dark:text-slate-50">
    <div><p className="text-sm font-semibold text-red-700 dark:text-red-300">Pinuyumayan v54</p><h1 className="text-3xl font-bold">Production Release / Music / Speech Governance Center</h1><p className="mt-2 text-slate-700 dark:text-slate-300">正式發布封板、合法語音資料、搜尋 rollout、metadata 公開、模型治理封存與營運監控自動化的整合工作台。</p></div>
    <div className="grid gap-4 md:grid-cols-2">{cards.map((card) => <article key={card.title} className="rounded-2xl border border-slate-200 bg-amber-50/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><h2 className="font-semibold">{card.title}</h2><p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{card.text}</p></article>)}</div>
  </section>;
}
