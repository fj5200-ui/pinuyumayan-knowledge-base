export function MusicSpeechReviewCenterV58() {
  const sections = [
    "正式 release certificate 完成封存",
    "dataset v58.0 train/dev/test gate",
    "搜尋正式設定與一鍵 rollback",
    "metadata 發布稽核封存",
    "治理中心 RBAC 下載與水印",
    "營運報告 Email / LINE / 後台通知實送",
  ];
  return (
    <section className="rounded-2xl border border-red-200 bg-white/95 p-6 shadow-xl dark:border-red-900 dark:bg-zinc-950/90">
      <p className="text-sm font-semibold text-red-700 dark:text-red-300">卑南族文化綜合平台｜Music Speech Governance v58</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">封存、資料集、搜尋、治理下載與營運通知正式工作台</h1>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {sections.map((section) => (
          <article key={section} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm font-medium text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
            {section}
          </article>
        ))}
      </div>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">v58 補上 release certificate seal、dataset v58.0 gate、formal search config、metadata audit seal、RBAC download audit 與 live delivery；沒有真實 VPS 與授權證據前仍維持 blocked。</p>
    </section>
  );
}
export default MusicSpeechReviewCenterV58;
