"use client";

import { useEffect, useMemo, useState } from "react";
import { createPuyumaPronunciationClient, type PronunciationAsset } from "../../frontend-sdk/puyumaPronunciationClient.v17";

export function PuyumaPronunciationPlayer({
  baseUrl,
  entryId,
  assetId,
  preferProxy = false
}: {
  baseUrl: string;
  entryId?: string;
  assetId?: string;
  preferProxy?: boolean;
}) {
  const client = useMemo(() => createPuyumaPronunciationClient({ baseUrl, preferProxy }), [baseUrl, preferProxy]);
  const [asset, setAsset] = useState<PronunciationAsset | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (assetId) {
          const head = await client.getHead(assetId);
          if (mounted) setAsset({
            assetId: head.assetId,
            entryId: head.entryId,
            puyumaForm: head.puyumaForm,
            zhTw: head.zhTw,
            dialectCode: head.dialectCode,
            dialectZh: head.dialectZh,
            sourceAudioUrl: head.playback?.sourceAudioUrl,
            proxyUrl: head.playback?.proxyUrl,
            mimeType: head.mimeType,
            reviewStatus: head.review?.reviewStatus
          });
          return;
        }
        if (entryId) {
          const items = await client.search({ q: entryId, limit: 1 });
          if (mounted) setAsset(items[0] ?? null);
        }
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "發音載入失敗");
      }
    }
    load();
    return () => { mounted = false; };
  }, [assetId, entryId, client]);

  if (error) return <div role="alert">{error}</div>;
  if (!asset) return <div>發音載入中...</div>;
  const url = client.audioUrl(asset);
  if (!url) return <div>此項目目前沒有可公開播放的真人音檔。</div>;

  return (
    <figure className="rounded-xl border p-4 shadow-sm">
      <figcaption className="mb-2">
        <div className="font-semibold">{asset.puyumaForm}</div>
        <div className="text-sm opacity-80">{asset.zhTw} · {asset.dialectZh}</div>
      </figcaption>
      <audio controls preload="none" src={url} className="w-full" />
      <p className="mt-2 text-xs opacity-70">真人來源音檔優先；未審核合成 TTS 不公開播放。</p>
    </figure>
  );
}
