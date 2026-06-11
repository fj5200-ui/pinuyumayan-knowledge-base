import { router, publicProcedure } from "../../trpc/init";

export const contractRouter = router({
  latest: publicProcedure.query(async () => ({
    ok: true,
    version: "v15",
    status: "not_run_in_scaffold",
    suites: ["public_read_contract", "internal_auth_contract"]
  })),
  run: publicProcedure.mutation(async () => ({
    ok: true,
    accepted: true,
    runId: `contract_${Date.now()}`,
    note: "Scaffold endpoint; production implementation should enqueue api_contract_test_runs."
  }))
});
