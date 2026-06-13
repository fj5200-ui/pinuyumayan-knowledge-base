export function MusicSpeechReviewCenterV56() {
  const sections = [
    "實機證書與備份證據入庫",
    "首批合法語音真實匯出",
    "搜尋 100% 切換後監控",
    "metadata 正式公開與撤稿紀錄",
    "治理中心下載與審計",
    "營運 SOP 週期化",
  ];
  return (
    <section className="rounded-2xl border border-red-200 bg-white/85 p-6 shadow-lg dark:border-red-900 dark:bg-zinc-950/80">
      <p className="text-sm font-semibold text-red-700 dark:text-red-300">卑南族文化綜合平台｜Music Speech Governance v56</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">證據入庫、資料集匯出與營運節奏化工作台</h1>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {sections.map((section) => (
          <article key={section} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
            {section}
          </article>
        ))}
      </div>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">所有 release、dataset、metadata 與模型治理操作預設 blocked，需真實 VPS evidence 與授權附件通過後才允許公開或訓練。</p>
    </section>
  );
}
export default MusicSpeechReviewCenterV56;
