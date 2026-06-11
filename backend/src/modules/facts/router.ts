import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";

export const factsRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(20), cursor: z.string().optional() }).default({ limit: 20 }))
    .query(async ({ ctx, input }) => {
      void ctx;
      return { items: [], nextCursor: null, limit: input.limit };
    }),
  byId: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      void ctx;
      void input;
      return null;
    })
});
