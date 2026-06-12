"use client";
import { useEffect, useState } from "react";
export function TtsSttEvaluationDashboardV42({ baseUrl }: { baseUrl: string }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => { Promise.all([
    fetch(`${baseUrl}/api/ops/speech-training/v42/authorized-review`).then(r=>r.json()),
    fetch(`${baseUrl}/api/ops/speech-training/v42/dataset-split`).then(r=>r.json()),
    fetch(`${baseUrl}/api/ops/speech-training/v42/evaluation-schema`).then(r=>r.json())
  ]).then(([review, split, schema]) => setData({ review, split, schema })); }, [baseUrl]);
  if (!data) return <section>Loading TTS/STT governance...</section>;
  return <section className="rounded-xl border p-4">
    <h2 className="text-xl font-semibold">TTS/STT 訓練治理 v42</h2>
    <p>候選語音：{data.review.counts.candidate_items}，可訓練：{data.review.counts.train_ready_items}</p>
    <p>公開 TTS：{String(data.review.public_synthetic_tts_enabled)}，公開 STT：{String(data.review.public_stt_enabled)}</p>
    <p>Split：train {data.split.current_split.train} / dev {data.split.current_split.dev} / test {data.split.current_split.test}</p>
  </section>;
}
