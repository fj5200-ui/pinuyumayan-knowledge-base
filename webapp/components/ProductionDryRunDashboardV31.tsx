"use client";
import { useEffect, useState } from "react";
import { createProductionDryRunClient } from "../lib/productionDryRunClient.v31";

export function ProductionDryRunDashboardV31({ kbBaseUrl }: { kbBaseUrl: string }) {
  const [state, setState] = useState<any>({ loading: true });
  useEffect(() => {
    const client = createProductionDryRunClient(kbBaseUrl);
    Promise.all([client.readiness(), client.checklist(), client.hmacCoverage()])
      .then(([readiness, checklist, hmac]) => setState({ loading: false, readiness, checklist, hmac }))
      .catch((error) => setState({ loading: false, error: String(error) }));
  }, [kbBaseUrl]);

  if (state.loading) return <section>讀取 v31 dry-run 狀態...</section>;
  if (state.error) return <section className="rounded border p-4 text-red-700">{state.error}</section>;
  const blockers = state.readiness?.blockers ?? [];
  return (
    <section className="space-y-4 rounded-2xl border p-5 shadow-sm">
      <header>
        <h2 className="text-xl font-semibold">v31 正式上線演練狀態</h2>
        <p className="text-sm opacity-80">此面板只顯示 dry-run 與主站搬移驗收，不會假裝已完成 VPS 千筆語料實跑。</p>
      </header>
      <div className="rounded-lg border p-3">
        <strong>Readiness:</strong> {state.readiness?.ok ? "可進 staging evidence" : "仍有阻擋項"}
        {blockers.length > 0 && <ul className="mt-2 list-disc pl-5">{blockers.map((b: string) => <li key={b}>{b}</li>)}</ul>}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border p-3">Checklist phases: {state.checklist?.checklist?.phases?.length ?? 0}</div>
        <div className="rounded-lg border p-3">HMAC route groups: {state.hmac?.coverage?.coverage_matrix?.length ?? 0}</div>
      </div>
    </section>
  );
}
