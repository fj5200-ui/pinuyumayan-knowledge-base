import { router, publicProcedure } from "../../trpc/init";

export const observabilityRouter = router({
  slo: publicProcedure.query(async () => ({
    ok: true,
    version: "v15",
    endpoints: [
      { key: "public_bootstrap", targetP95Ms: 800, availabilityPct: 99.5 },
      { key: "public_vocabulary", targetP95Ms: 1000, availabilityPct: 99.0 },
      { key: "internal_delta", targetP95Ms: 1500, availabilityPct: 99.0 }
    ]
  })),
  dashboard: publicProcedure.query(async () => ({
    ok: true,
    version: "v15",
    dashboards: ["main_site_delivery", "full_corpus_import", "security_ops", "search_quality"]
  }))
});
