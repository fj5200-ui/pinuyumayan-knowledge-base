import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";
import { assertStrongPassword } from "../../security/passwordHash";
export const adminAuthRouter = router({
    login: publicProcedure
        .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
        .mutation(({ input }) => {
        // Implementation target: verify password_hash from admin_users and create admin_sessions.
        return { ok: true, status: "placeholder", email: input.email, next: "connect admin_users/admin_sessions table" };
    }),
    me: publicProcedure.query(() => ({ ok: true, status: "placeholder", roles: [] })),
    changePassword: publicProcedure
        .input(z.object({ currentPassword: z.string(), nextPassword: z.string() }))
        .mutation(({ input }) => {
        assertStrongPassword(input.nextPassword);
        return { ok: true, status: "placeholder", rotated: true };
    })
});
