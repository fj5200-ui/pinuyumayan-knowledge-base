export type ImportStage = {
  key: string;
  label_zh: string;
  expected_output: string;
};

export function CorpusImportMonitor({ stages }: { stages: ImportStage[] }) {
  return (
    <section className="rounded-2xl border p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">卑南語全量語料匯入流程</h2>
      <ol className="space-y-2">
        {stages.map((stage, index) => (
          <li key={stage.key} className="rounded-xl border p-3">
            <div className="text-sm font-medium">{index + 1}. {stage.label_zh}</div>
            <div className="text-xs opacity-70">輸出：{stage.expected_output}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}

