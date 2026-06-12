'use client';
import { useEffect, useState } from 'react';
import { createVpsDryRunBackfillClientV32 } from '../lib/vpsDryRunBackfillClient.v32';

export function VpsDryRunBackfillDashboardV32({ baseUrl }: { baseUrl: string }) {
  const [state, setState] = useState<any>({ loading: true });
  useEffect(() => {
    const client = createVpsDryRunBackfillClientV32({ baseUrl });
    Promise.all([client.dryRunPlan(), client.hmacEnforcement(), client.corpusBackfill(), client.searchSeoSuite()])
      .then(([dryRun, hmac, corpus, search]) => setState({ loading: false, dryRun, hmac, corpus, search }))
      .catch((error) => setState({ loading: false, error: String(error) }));
  }, [baseUrl]);
  if (state.loading) return <section>載入 v32 VPS dry-run 狀態...</section>;
  if (state.error) return <section className="rounded border p-4 text-red-600">{state.error}</section>;
  return <section className="space-y-4 rounded border p-4">
    <h2 className="text-xl font-semibold">v32 VPS Dry-run Backfill Dashboard</h2>
    <p>此面板用來查看 VPS dry-run 回填、HMAC internal API 強制、千筆語料報告與搜尋/SEO 驗收規格。</p>
    <pre className="overflow-auto rounded bg-black/5 p-3 text-xs">{JSON.stringify(state, null, 2)}</pre>
  </section>;
}
