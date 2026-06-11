import { z } from "zod";
import { router, publicProcedure } from "../../trpc/root";

export const cacheOpsRouter = router({
  invalidate: publicProcedure
    .input(z.object({ target: z.string().min(1), releaseChannel: z.string().optional(), reason: z.string().min(3) }))
    .mutation(async ({ input }) => {
      // Implementation target: require internal scope cache:invalidate and insert cache_invalidation_jobs.
      return { queued: true, target: input.target, releaseChannel: input.releaseChannel ?? "public" };
    })
});
