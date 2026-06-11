export type AudioAsset = {
  id: string;
  corpus_entry_id: string;
  source_audio_url: string;
  mirror_status: 'pending_license_review' | 'approved_for_mirror' | 'mirroring' | 'mirrored' | 'failed' | 'blocked_by_license' | string;
  license_status?: string;
};

export function AudioAssetManager({ assets }: { assets: AudioAsset[] }) {
  return (
    <section className="rounded-2xl border p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">音檔資產管理</h2>
      <div className="space-y-2">
        {assets.map((asset) => (
          <article key={asset.id} className="rounded-xl border p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs">{asset.corpus_entry_id}</span>
              <span className="rounded-full border px-2 py-1 text-xs">{asset.mirror_status}</span>
            </div>
            <audio className="mt-2 w-full" controls preload="none" src={asset.source_audio_url} />
          </article>
        ))}
      </div>
    </section>
  );
}

