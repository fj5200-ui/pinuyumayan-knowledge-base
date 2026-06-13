import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";
export const adminSyncRouter = router({
    syncSuperadminToMainSite: publicProcedure
        .input(z.object({ email: z.string().email(), displayName: z.string().min(1).optional() }))
        .mutation(({ input }) => ({ ok: true, status: "queued", email: input.email, warning: "Never sync plaintext passwords; sync identity and role only." })),
    syncStatus: publicProcedure
        .input(z.object({ email: z.string().email().optional() }).optional())
        .query(({ input }) => ({ ok: true, status: "placeholder", email: input?.email ?? null }))
});
