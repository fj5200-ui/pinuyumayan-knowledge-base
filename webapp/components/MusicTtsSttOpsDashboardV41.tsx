"use client";
import { useEffect, useState } from "react";
export function MusicTtsSttOpsDashboardV41({ baseUrl }: { baseUrl: string }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => { Promise.all([
    fetch(`${baseUrl}/api/ops/speech-training/v41/manifest`).then(r => r.json()),
    fetch(`${baseUrl}/api/ops/music-folk-song/v41/review-queue`).then(r => r.json()),
    fetch(`${baseUrl}/api/ops/music-folk-song/v41/youtube-worker-contract`).then(r => r.json()),
  ]).then(([manifest, queue, worker]) => setData({ manifest, queue, worker })); }, [baseUrl]);
  if (!data) return <div>載入 v41 音樂 / TTS / STT 營運資料中…</div>;
  return <section className="rounded-xl border p-4 space-y-3">
    <h2 className="text-xl font-semibold">v41 音樂 / TTS / STT 營運面板</h2>
    <p>候選語音項目：{data.manifest?.counts?.candidate_items ?? 0}；可訓練項目：{data.manifest?.counts?.train_ready_items ?? 0}</p>
    <p>審核佇列：{data.queue?.items?.length ?? 0} 筆；YouTube worker：{data.worker?.mode}</p>
    <p className="text-sm opacity-70">安全規則：不下載 YouTube 音訊/影片，不保存完整歌詞，不使用未授權音源訓練。</p>
  </section>;
}
