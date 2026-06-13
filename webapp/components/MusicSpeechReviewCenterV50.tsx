type Card = { card_id: string; title: string; status: string; endpoint: string };
const cards: Card[] = [
  { card_id: "production-cutover", title: "正式上線切換", status: "requires_real_vps_cutover", endpoint: "/api/ops/vps/v50/cutover-plan" },
  { card_id: "audit-evidence", title: "審核證據鏈完整化", status: "append_only_store_ready", endpoint: "/api/admin/speech-training/v50/evidence-store" },
  { card_id: "search-intelligence", title: "搜尋智慧化", status: "manual_review_required", endpoint: "/api/ops/search/music/v50/intelligence" },
  { card_id: "authority-publication", title: "權威資料 metadata-only 發布", status: "pending_rights_review", endpoint: "/api/ops/authority-sources/v50/metadata-publication" },
  { card_id: "model-governance-delivery", title: "模型治理交付", status: "blocked_until_evidence_passes", endpoint: "/api/ops/speech-training/v50/governance-delivery" },
  { card_id: "brand-completion", title: "前台品牌完成", status: "pending_browser_validation", endpoint: "/api/ops/site/v50/brand-completion" }
];

export function MusicSpeechReviewCenterV50() {
  return (
    <section className="mx-auto max-w-7xl space-y-6 p-6 text-slate-950 dark:text-white">
      <div className="rounded-[1.35rem] border border-red-200 bg-white/95 p-6 shadow-xl shadow-red-950/5 backdrop-blur dark:border-red-900/60 dark:bg-zinc-950/95">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-red-700 dark:text-red-300">Pinuyumayan v50</p>
        <h1 className="mt-2 text-3xl font-bold">正式上線切換與治理交付中心</h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-700 dark:text-zinc-300">集中處理 blue-green / rolling deployment、不可變 evidence store、搜尋智慧化、權威 metadata-only 發布、模型治理 PDF 交付與前台品牌驗收。未完成 VPS 實機切換與證據鏈前，公開釋出 gate 維持關閉。</p>
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
export default MusicSpeechReviewCenterV50;
