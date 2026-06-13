type Card = { card_id: string; title: string; status: string; endpoint: string };
const cards: Card[] = [
  { card_id: "cutover-seal", title: "實機切換封板", status: "pending_real_vps_evidence", endpoint: "/api/ops/vps/v51/cutover-seal" },
  { card_id: "evidence-upload", title: "審核證據鏈實物上傳", status: "blocked_until_real_upload", endpoint: "/api/admin/speech-training/v51/evidence-upload" },
  { card_id: "search-ab", title: "搜尋 A/B 實測", status: "ready_pending_real_traffic", endpoint: "/api/ops/search/music/v51/ab-experiment" },
  { card_id: "authority-live-publish", title: "權威 metadata 上架", status: "pending_rights_approval", endpoint: "/api/ops/authority-sources/v51/live-publication" },
  { card_id: "model-pdf-renderer", title: "模型治理 PDF renderer", status: "renderer_required_on_vps", endpoint: "/api/ops/speech-training/v51/governance-renderer" },
  { card_id: "brand-performance", title: "品牌驗收與效能實測", status: "pending_lighthouse_cwv", endpoint: "/api/ops/site/v51/brand-performance" }
];

export function MusicSpeechReviewCenterV51() {
  return (
    <section className="mx-auto max-w-7xl space-y-6 p-6 text-slate-950 dark:text-white">
      <div className="rounded-[1.35rem] border border-red-200 bg-white/95 p-6 shadow-xl shadow-red-950/5 backdrop-blur dark:border-red-900/60 dark:bg-zinc-950/95">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-red-700 dark:text-red-300">Pinuyumayan v51</p>
        <h1 className="mt-2 text-3xl font-bold">實機封板、證據鏈與品牌效能驗收中心</h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-700 dark:text-zinc-300">v51 將 v50 合約推進到實機操作層：VPS cutover seal、實物 evidence upload、搜尋 A/B、權威 metadata 上架、模型治理 PDF renderer 與 Lighthouse/CWV 驗收。未取得真實證據前公開釋出 gate 維持關閉。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article key={card.card_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-xl font-semibold">{card.title}</h2>
            <p className="mt-2 inline-flex rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-950 dark:bg-yellow-900/40 dark:text-yellow-100">{card.status}</p>
            <code className="mt-4 block overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-900 dark:bg-zinc-900 dark:text-zinc-200">{card.endpoint}</code>
          </article>
        ))}
      </div>
    </section>
  );
}
export default MusicSpeechReviewCenterV51;
