export type CutoverReadiness = { ok: boolean; version: string; mode: string; dbMode: string; staticFallbackDisabled: boolean; hmacEnabled: boolean; totalChecklistItems: number; launchRecommendation: string; };
export function createProductionCutoverClient(baseUrl: string) {
  const api = baseUrl.replace(/\/$/, "");
  return {
    async readiness(): Promise<CutoverReadiness> { const res = await fetch(`${api}/api/ops/cutover/v30/readiness`, { cache: "no-store" }); if (!res.ok) throw new Error(`readiness failed ${res.status}`); return res.json(); },
    async checklist() { const res = await fetch(`${api}/api/ops/cutover/v30/checklist`, { cache: "no-store" }); if (!res.ok) throw new Error(`checklist failed ${res.status}`); return res.json(); },
    async mainSiteAcceptance() { const res = await fetch(`${api}/api/ops/main-site/v30/acceptance`, { cache: "no-store" }); if (!res.ok) throw new Error(`acceptance failed ${res.status}`); return res.json(); }
  };
}
