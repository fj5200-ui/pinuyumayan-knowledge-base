import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";
export const contentRouter = router({
    collections: publicProcedure
        .input(z.object({ channel: z.string().default("public") }).optional())
        .query(({ input }) => ({ ok: true, status: "placeholder", channel: input?.channel ?? "public", collections: [] })),
    bySlug: publicProcedure
        .input(z.object({ slug: z.string().min(1) }))
        .query(({ input }) => ({ ok: true, status: "placeholder", slug: input.slug, item: null }))
});
