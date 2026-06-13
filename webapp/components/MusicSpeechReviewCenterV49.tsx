type Card = { card_id: string; title: string; status: string; endpoint: string };
const cards: Card[] = [
  { card_id: "vps-release", title: "VPS 上線收斂", status: "requires_real_vps_run", endpoint: "/api/ops/vps/v49/release-validation-report" },
  { card_id: "review-workbench", title: "審核工作台資料實接", status: "api_contract_ready", endpoint: "/api/admin/music-speech/v49/live-workbench" },
  { card_id: "search-optimization", title: "搜尋品質自動優化", status: "manual_review_required", endpoint: "/api/ops/search/music/v49/auto-optimization" },
  { card_id: "authority-citation", title: "權威引用完整度", status: "metadata_only_pending_review", endpoint: "/api/ops/authority-sources/v49/citation-completeness" },
  { card_id: "model-governance", title: "模型治理匯出", status: "blocked_until_evidence_passes", endpoint: "/api/ops/speech-training/v49/governance-export" },
  { card_id: "site-performance", title: "主站視覺與效能", status: "post_deploy_validation_ready", endpoint: "/api/ops/site/v49/design-system-performance" }
];

export function MusicSpeechReviewCenterV49() {
  return (
    <section className="mx-auto max-w-7xl space-y-6 p-6 text-slate-950 dark:text-white">
      <div className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900/60 dark:bg-zinc-950">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700 dark:text-red-300">Pinuyumayan v49</p>
        <h1 className="mt-2 text-3xl font-bold">TTS/STT Music 上線收斂工作台</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700 dark:text-zinc-300">集中查看 VPS 驗收、審核工作台、搜尋自動優化、權威來源引用完整度、模型治理匯出與主站視覺效能。所有公開釋出 gate 預設維持關閉。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article key={card.card_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-xl font-semibold">{card.title}</h2>
            <p className="mt-2 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-100">{card.status}</p>
            <code className="mt-4 block overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-900 dark:bg-zinc-900 dark:text-zinc-200">{card.endpoint}</code>
          </article>
        ))}
      </div>
    </section>
  );
}
export default MusicSpeechReviewCenterV49;
