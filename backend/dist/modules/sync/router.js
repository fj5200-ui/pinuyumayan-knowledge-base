import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";
export const syncRouter = router({
    replayPlan: publicProcedure
        .input(z.object({ since: z.string().optional(), until: z.string().optional() }))
        .query(({ input }) => ({
        status: "plan_only",
        since: input.since ?? null,
        until: input.until ?? null,
        maxWindowDays: 30
    }))
});
