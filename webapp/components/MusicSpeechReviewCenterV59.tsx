import React from "react";

const sections = [
  "實機封存完成後二次驗證",
  "dataset v58.0 真實釋出與凍結 gate",
  "production search policy / SLA / rollback drill",
  "metadata 稽核公開擴充與撤稿演練",
  "治理下載水印、異常告警與 audit export 簽核",
  "營運通知 ack / escalation / close / retrospective 閉環",
];

export function MusicSpeechReviewCenterV59() {
  return (
    <section className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900/40 dark:bg-zinc-950">
      <div className="mb-4">
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">v59 Governance Center</p>
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">卑南族文化綜合平台｜TTS/STT 與音樂治理封存</h1>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">所有語音資料在真實 license、speaker consent、alignment、母語者 review 完成前維持 blocked；metadata 僅允許 metadata-only，不開放音訊與完整歌詞。</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {sections.map((item) => <div key={item} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm font-medium text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">{item}</div>)}
      </div>
    </section>
  );
}
export default MusicSpeechReviewCenterV59;
