"use client";
import { useEffect, useState } from "react";

export function FullCorpusAcceptancePanelV27({ apiBase = "" }: { apiBase?: string }) {
  const [state, setState] = useState<any>(null);
  useEffect(() => { fetch(`${apiBase}/api/admin/corpus/v27/acceptance-latest`).then(r=>r.json()).then(setState).catch(e=>setState({ ok:false, error:String(e) })); }, [apiBase]);
  const latest = state?.data?.latest;
  return <section className="rounded-xl border p-4">
    <h2 className="text-lg font-semibold">千筆語料驗收 v27</h2>
    {!latest && <p className="text-sm text-amber-700">尚未產生 VPS staging full corpus 驗收報告；目前仍以 80 筆 preview subset 為主。</p>}
    {latest && <dl className="grid grid-cols-2 gap-2 text-sm">
      <dt>狀態</dt><dd>{latest.status}</dd>
      <dt>總筆數</dt><dd>{latest.total_entries}</dd>
      <dt>真人音檔覆蓋率</dt><dd>{latest.audio_coverage_ratio}</dd>
      <dt>source PHON 覆蓋率</dt><dd>{latest.source_phon_coverage_ratio}</dd>
      <dt>授權阻擋</dt><dd>{latest.license_blocker_count}</dd>
    </dl>}
  </section>;
}
