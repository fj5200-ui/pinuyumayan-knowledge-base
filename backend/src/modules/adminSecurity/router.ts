import { router, publicProcedure } from "../../trpc/root";

export const adminSecurityRouter = router({
  sessions: publicProcedure.query(async () => {
    // Implementation target: require admin:security and list active admin_sessions.
    return { items: [] };
  }),
  mfaStatus: publicProcedure.query(async () => {
    // Implementation target: return MFA enrollment state for current admin.
    return { enabled: false, required: true };
  })
});
