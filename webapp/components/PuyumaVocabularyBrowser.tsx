import { PuyumaAudioCard, type PuyumaAudioEntry } from './PuyumaAudioCard';

export function PuyumaVocabularyBrowser({ entries }: { entries: PuyumaAudioEntry[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {entries.map((entry) => <PuyumaAudioCard key={entry.id} entry={entry} />)}
    </section>
  );
}
