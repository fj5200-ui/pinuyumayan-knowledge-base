"use client";
import { useEffect, useState } from "react";
import { createTtsSttMusicClientV44 } from "../../frontend-sdk/ttsSttMusicClient.v44";

type ReviewState = {
  review?: any;
  exportContract?: any;
  center?: any;
  worker?: any;
  db?: any;
  error?: string;
};

export function MusicSpeechReviewCenterV44({ baseUrl }: { baseUrl: string }) {
  const [data, setData] = useState<ReviewState | null>(null);

  useEffect(() => {
    const client = createTtsSttMusicClientV44({ baseUrl });
    Promise.all([
      client.authorizedReview(),
      client.exportContract(),
      client.reviewCenter(),
      client.authorityWorkerContract(),
      client.musicDbContract(),
    ])
      .then(([review, exportContract, center, worker, db]) => setData({ review, exportContract, center, worker, db }))
      .catch((error) => setData({ error: String(error) }));
  }, [baseUrl]);

  if (!data) return <section className="rounded-xl border p-4">載入 v44 審核中心...</section>;
  if (data.error) return <pre className="rounded-xl border p-4 text-red-600">{data.error}</pre>;

  const current = data.review?.current_state ?? {};
  const panels = data.center?.panels ?? [];

  return (
    <section className="space-y-4 rounded-2xl border bg-white/70 p-6 shadow-sm backdrop-blur dark:bg-zinc-950/70">
      <div>
        <p className="text-sm font-medium text-red-700">v44 Music + Speech Review Center</p>
        <h2 className="text-2xl font-semibold">授權、語音、音樂候選審核中心</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Preview assets 未通過 license、speaker consent、alignment 前不進 train/dev/test，不開放公開 TTS/STT。
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Preview assets" value={current.preview_candidates ?? 0} />
        <Metric label="Blocked" value={current.blocked_until_review ?? 0} />
        <Metric label="Train ready" value={data.exportContract?.current_split?.train ?? 0} />
        <Metric label="Public TTS/STT" value="OFF" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {panels.map((panel: any) => (
          <article key={panel.key} className="rounded-xl border bg-white/60 p-4 dark:bg-zinc-900/60">
            <h3 className="font-semibold">{panel.title}</h3>
            <code className="mt-2 block break-all text-xs text-zinc-500">{panel.endpoint}</code>
          </article>
        ))}
      </div>
      <details className="rounded-xl border p-4">
        <summary className="cursor-pointer font-medium">v44 contracts</summary>
        <pre className="mt-3 max-h-[440px] overflow-auto text-xs">{JSON.stringify({ export: data.exportContract, worker: data.worker, db: data.db }, null, 2)}</pre>
      </details>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-white/60 p-4 dark:bg-zinc-900/60">
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
