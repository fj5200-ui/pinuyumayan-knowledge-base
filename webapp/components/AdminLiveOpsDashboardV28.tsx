'use client';

import { useEffect, useState } from 'react';

type PanelState = {
  dataMode?: unknown;
  corpus?: unknown;
  search?: unknown;
  hmac?: unknown;
};

async function getJson(path: string) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json();
}

export function AdminLiveOpsDashboardV28() {
  const [state, setState] = useState<PanelState>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getJson('/api/ops/data-mode/v28/status'),
      getJson('/api/admin/corpus/v28/acceptance-latest'),
      getJson('/api/ops/search/v28/index-status'),
      getJson('/api/ops/security/v28/hmac-failures')
    ])
      .then(([dataMode, corpus, search, hmac]) => setState({ dataMode, corpus, search, hmac }))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section className="rounded-2xl border p-4 shadow-sm">
      <h2 className="text-xl font-semibold">V28 後台營運檢查</h2>
      <p className="mt-1 text-sm text-neutral-600">顯示 DB 模式、千筆語料驗收、搜尋索引與 HMAC 失敗狀態。</p>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <pre className="mt-4 overflow-auto rounded-xl bg-neutral-950 p-3 text-xs text-neutral-50">
        {JSON.stringify(state, null, 2)}
      </pre>
    </section>
  );
}
