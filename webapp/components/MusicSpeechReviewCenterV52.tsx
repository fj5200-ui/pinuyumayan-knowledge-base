export function MusicSpeechReviewCenterV52() {
  const cards = [
    { title: "實機上線執行", status: "ready_for_vps_execution", detail: "health / DNS / rollback / 30 分鐘觀測" },
    { title: "證據鏈開通", status: "blocked_until_real_uploads", detail: "80 筆 preview assets 仍需實物證據" },
    { title: "搜尋 A/B 收斂", status: "pending_real_traffic", detail: "10% traffic metrics 後決定 rollout" },
    { title: "權威 metadata 發布", status: "blocked_until_rights_approval", detail: "metadata-only，不公開音訊與歌詞" },
    { title: "模型治理簽核", status: "blocked_until_evidence_chain", detail: "水印 PDF / lineage / version diff" },
    { title: "品牌效能監控", status: "ready_pending_browser_run", detail: "Lighthouse / CWV / 截圖 / OG / sitemap" }
  ];
  return (
    <section className="rounded-3xl border border-red-200 bg-white/85 p-6 shadow-xl backdrop-blur dark:border-red-900/60 dark:bg-zinc-950/80">
      <div className="mb-6">
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">Pinuyumayan v52</p>
        <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">Music / Speech 上線治理中心</h2>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">v52 將 v51 封板合約推進到實機執行包、證據鏈開通、A/B 收斂、metadata 發布與正式監控。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="font-semibold text-zinc-950 dark:text-white">{card.title}</h3>
            <p className="mt-1 text-xs font-mono text-red-700 dark:text-red-300">{card.status}</p>
            <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">{card.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
export default MusicSpeechReviewCenterV52;
