"use client";

import { useEffect, useState } from "react";

export function MainSiteConnectionStatusV23() {
  const [state, setState] = useState<{ ok?: boolean; status?: number; error?: string }>({});

  useEffect(() => {
    fetch("/api/kb/health")
      .then((r) => r.json())
      .then(setState)
      .catch((err) => setState({ ok: false, error: String(err) }));
  }, []);

  return (
    <div className="rounded-xl border p-4 text-sm">
      <div className="font-semibold">Pinuyumayan Knowledge Backend</div>
      <div>{state.ok ? "已連線" : "未連線或檢查中"}</div>
      {state.status ? <div>HTTP {state.status}</div> : null}
      {state.error ? <pre className="whitespace-pre-wrap">{state.error}</pre> : null}
    </div>
  );
}
