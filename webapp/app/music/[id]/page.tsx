import { createTtsSttMusicClientV44 } from "../../../../frontend-sdk/ttsSttMusicClient.v44";
import { createTtsSttMusicClientV45 } from "../../../../frontend-sdk/ttsSttMusicClient.v45";

const API_BASE = process.env.NEXT_PUBLIC_PINUYUMAYAN_API_BASE_URL ?? "http://localhost:8787";

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const seo = await createTtsSttMusicClientV45({ baseUrl: API_BASE }).musicSeo(params.id);
    return { title: `${seo.og?.title ?? "音樂 metadata"}`, description: seo.json_ld?.description ?? "卑南族歌謠／歌曲 metadata 詳情頁。", openGraph: { title: seo.og?.title, description: seo.json_ld?.description, type: "music.song" } };
  } catch {
    return { title: `音樂 metadata｜${params.id}`, description: "卑南族歌謠／歌曲 metadata 詳情頁。未審核候選不提供完整歌詞或音訊下載。" };
  }
}

export default async function MusicMetadataPage({ params }: { params: { id: string } }) {
  const client = createTtsSttMusicClientV44({ baseUrl: API_BASE });
  const seoClient = createTtsSttMusicClientV45({ baseUrl: API_BASE });
  const data = await client.musicMetadata(params.id);
  const seo = await seoClient.musicSeo(params.id).catch(() => null);
  const item = data.item;
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-zinc-950 dark:text-zinc-50">
      <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">Metadata only｜v45 SEO guarded</p>
        <h1 className="text-3xl font-semibold">{item.title}</h1>
        <p className="mt-4 text-zinc-700 dark:text-zinc-300">{item.summary ?? item.body}</p>
        <dl className="mt-6 grid gap-3 text-sm md:grid-cols-2"><Field label="Artist / Source" value={item.artist || item.source_title || "待審核"} /><Field label="Community" value={item.community || "待補"} /><Field label="Work type" value={item.work_type || "metadata"} /><Field label="Rights" value={item.rights_status || "metadata_only_review_required"} /></dl>
        <p className="mt-6 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-950 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100">本頁不刊登完整歌詞、不提供音訊下載；來源、權利、敏感分級通過後才會擴充公開內容。</p>
        {seo?.json_ld ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.json_ld) }} /> : null}
      </article>
    </main>
  );
}
function Field({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"><dt className="text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>; }
