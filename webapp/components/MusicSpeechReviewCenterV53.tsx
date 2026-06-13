export default function MusicSpeechReviewCenterV53() {
  const cards = [
    { title: "實機證據回填", text: "health / DNS / rollback / backup restore / 30 分鐘觀測回填。" },
    { title: "首批合法語音資料", text: "20 筆候選資料維持 blocked，等待真實 license、consent、alignment、native review。" },
    { title: "搜尋排序升級", text: "LTR、typo tolerance、intent routing 需 live A/B 指標後才 rollout。" },
    { title: "metadata 公開發布", text: "metadata-only，上線前保留 no audio / no lyrics guard。" },
    { title: "模型治理封板", text: "PDF renderer、lineage DAG、version diff、release blocker closure。" },
    { title: "正式監控營運", text: "uptime、CWV、Lighthouse、OG、sitemap、錯誤率每日/每週報告。" }
  ];
  return <section className="space-y-6 rounded-3xl border border-red-200 bg-white p-6 text-slate-950 shadow-sm dark:border-red-900/50 dark:bg-slate-950 dark:text-slate-50">
    <div><p className="text-sm font-semibold text-red-700 dark:text-red-300">Pinuyumayan v53</p><h1 className="text-3xl font-bold">Music / Speech Governance Center</h1><p className="mt-2 text-slate-700 dark:text-slate-300">正式上線證據、合法語音資料、搜尋排序、metadata 發布、模型治理與營運監控的封板工作台。</p></div>
    <div className="grid gap-4 md:grid-cols-2">{cards.map((card) => <article key={card.title} className="rounded-2xl border border-slate-200 bg-amber-50/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><h2 className="font-semibold">{card.title}</h2><p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{card.text}</p></article>)}</div>
  </section>;
}
