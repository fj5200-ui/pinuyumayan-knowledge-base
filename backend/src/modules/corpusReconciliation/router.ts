import { router, publicProcedure } from "../../trpc/init";

export const corpusReconciliationRouter = router({
  latest: publicProcedure.query(async () => ({
    ok: true,
    version: "v15",
    expectedSourceCandidates: 66,
    minimumFullCorpusEntries: 1000,
    status: "pending_full_import"
  })),
  enqueue: publicProcedure.mutation(async () => ({
    ok: true,
    accepted: true,
    jobId: `corpus_reconcile_${Date.now()}`,
    note: "Run after full corpus import; production worker writes corpus_reconciliation_runs."
  }))
});
