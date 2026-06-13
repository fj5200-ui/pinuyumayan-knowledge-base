import { createTtsSttMusicClientV44 } from "../../../frontend-sdk/ttsSttMusicClient.v44";

const API_BASE = process.env.NEXT_PUBLIC_PINUYUMAYAN_API_BASE_URL ?? "http://localhost:8787";

export const metadata = {
  title: "卑南語 TTS/STT 實驗說明｜Pinuyumayan",
  description: "卑南語 TTS/STT 實驗資料治理、授權審核、模型卡與公開限制說明。",
};

export default async function TtsSttInfoPage() {
  const client = createTtsSttMusicClientV44({ baseUrl: API_BASE });
  const data = await client.ttsSttInfo();
  const review = data.review ?? {};
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <section className="rounded-3xl border bg-white/70 p-6 shadow-sm backdrop-blur dark:bg-zinc-950/70">
        <p className="text-sm font-medium text-red-700">TTS/STT v44</p>
        <h1 className="text-3xl font-semibold">卑南語 TTS/STT 實驗說明</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">目前僅為內部實驗治理；公開 TTS 與 STT 皆關閉。資料必須通過授權、說話者同意、逐句對齊與真人審核後，才可進入 train/dev/test。</p>
      </section>
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Preview" value={review.preview_candidates ?? 0} />
        <Metric label="Blocked" value={review.blocked_until_review ?? 0} />
        <Metric label="Public TTS" value={data.public_tts_enabled ? "ON" : "OFF"} />
        <Metric label="Public STT" value={data.public_stt_enabled ? "ON" : "OFF"} />
      </div>
      <section className="rounded-2xl border p-5">
        <h2 className="text-xl font-semibold">公開前必要條件</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-zinc-600 dark:text-zinc-300">
          <li>license / rights evidence 完整。</li>
          <li>speaker consent 或 archive permission 已記錄。</li>
          <li>alignment verified，且方言與 transcript 經審核。</li>
          <li>TTS MOS、STT WER/CER 通過門檻，且通過人工審核。</li>
        </ul>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border p-5"><div className="text-xs uppercase text-zinc-500">{label}</div><div className="mt-1 text-2xl font-semibold">{value}</div></div>;
}
