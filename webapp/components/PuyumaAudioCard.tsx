export type PuyumaAudioEntry = {
  id: string;
  language: { dialect_zh: string; dialect_name: string };
  category: { website_category_label_zh: string };
  text: { puyuma_form: string; zh_tw: string; en?: string };
  audio: { url: string; website_playback?: { fallback_text_zh?: string } };
  ipa?: { value: string; status: string };
  g2p?: { phoneme_sequence: string[]; status: string };
  tts?: { enabled_for_public_ui: boolean; tts_text: string; status: string };
  source: { source_path: string };
};

export function PuyumaAudioCard({ entry }: { entry: PuyumaAudioEntry }) {
  return (
    <article className="rounded-xl border p-4 shadow-sm">
      <div className="mb-2 text-sm opacity-70">{entry.language.dialect_zh} · {entry.category.website_category_label_zh}</div>
      <h3 className="text-xl font-semibold">{entry.text.puyuma_form}</h3>
      {entry.ipa?.value ? <p className="mt-1 font-mono text-sm">IPA draft: /{entry.ipa.value}/</p> : null}
      <p className="mt-2">{entry.text.zh_tw}</p>
      {entry.text.en ? <p className="text-sm opacity-70">{entry.text.en}</p> : null}
      <audio className="mt-3 w-full" controls preload="none" src={entry.audio.url} />
      <details className="mt-3 text-xs opacity-75">
        <summary>G2P / TTS / Source</summary>
        <p>G2P: {entry.g2p?.phoneme_sequence?.join(' ')}</p>
        <p>TTS public enabled: {String(entry.tts?.enabled_for_public_ui ?? false)}</p>
        <p>Source: {entry.source.source_path}</p>
      </details>
    </article>
  );
}
