'use client';

import { useEffect, useState } from 'react';

type DashboardState = Record<string, unknown>;

async function load(path: string) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json();
}

export function AdminVpsActualOpsDashboardV29() {
  const [state, setState] = useState<DashboardState>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      load('/api/ops/vps/v29/readiness'),
      load('/api/admin/corpus/v29/runs'),
      load('/api/ops/search/v29/population-runs'),
      load('/api/ops/fallback/v29/route-coverage'),
      load('/api/ops/vps-db/v29/backup-restore-checksum')
    ]).then(([readiness, corpus, search, fallback, backup]) => {
      setState({ readiness, corpus, search, fallback, backup });
    }).catch((err) => setError(err.message));
  }, []);

  return (
    <section className="space-y-4 rounded-2xl border p-4 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold">V29 VPS 實際營運 Dashboard</h2>
        <p className="text-sm text-neutral-600">檢查 VPS DB、千筆語料、搜尋索引、fallback coverage 與備份還原。</p>
      </div>
      {error ? <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
      <pre className="max-h-[560px] overflow-auto rounded-xl bg-neutral-950 p-4 text-xs text-white">{JSON.stringify(state, null, 2)}</pre>
    </section>
  );
}
