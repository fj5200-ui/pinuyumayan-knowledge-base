"use client";
import { useEffect, useState } from "react";
import { createProductionCutoverClient } from "../lib/productionCutoverClient.v30";
export function ProductionCutoverDashboardV30({ baseUrl }: { baseUrl: string }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>("");
  useEffect(() => { const client = createProductionCutoverClient(baseUrl); client.readiness().then(setData).catch((e) => setError(String(e))); }, [baseUrl]);
  if (error) return <div className="rounded border p-4 text-red-600">{error}</div>;
  if (!data) return <div className="rounded border p-4">Loading cutover readiness...</div>;
  return <section className="rounded-2xl border p-5 shadow-sm"><h2 className="text-xl font-semibold">v30 Production Cutover Readiness</h2><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt>Mode</dt><dd className="font-mono">{data.mode}</dd></div><div><dt>DB Mode</dt><dd className="font-mono">{data.dbMode}</dd></div><div><dt>HMAC</dt><dd>{data.hmacEnabled ? "enabled" : "not enabled"}</dd></div><div><dt>Static fallback disabled</dt><dd>{data.staticFallbackDisabled ? "yes" : "no"}</dd></div><div><dt>Checklist items</dt><dd>{data.totalChecklistItems}</dd></div><div><dt>Recommendation</dt><dd>{data.launchRecommendation}</dd></div></dl></section>;
}
