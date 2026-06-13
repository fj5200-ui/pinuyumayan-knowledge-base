export function MusicSpeechReviewCenterV57() {
  const sections = [
    "實機 release evidence 實際入庫",
    "首批 train/dev/test 正式產生",
    "搜尋 24/72 小時結果決策",
    "metadata 發布證據封存",
    "治理中心審計查詢上線",
    "營運報告自動寄送",
  ];
  return (
    <section className="rounded-2xl border border-red-200 bg-white/90 p-6 shadow-xl dark:border-red-900 dark:bg-zinc-950/85">
      <p className="text-sm font-semibold text-red-700 dark:text-red-300">卑南族文化綜合平台｜Music Speech Governance v57</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">證據封存、資料集匯出與營運通知工作台</h1>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {sections.map((section) => (
          <article key={section} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm font-medium text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
            {section}
          </article>
        ))}
      </div>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">v57 新增 ledger seal、train/dev/test gate、24/72 決策、publication evidence、audit export 與 Email/LINE/後台通知；沒有真實授權與 VPS 證據前仍維持 blocked。</p>
    </section>
  );
}
export default MusicSpeechReviewCenterV57;
