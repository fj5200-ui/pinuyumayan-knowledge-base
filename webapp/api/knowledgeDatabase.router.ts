import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from './trpc';

export const knowledgeDatabaseRouter = router({
  listFacts: publicProcedure
    .input(z.object({ category: z.string().optional(), q: z.string().optional(), limit: z.number().min(1).max(100).default(20) }))
    .query(async ({ input, ctx }) => {
      // TODO: wire to kb_facts. Public route must filter restricted/high details.
      return ctx.db.knowledge.listPublicFacts(input);
    }),

  searchPuyuma: publicProcedure
    .input(z.object({
      q: z.string().optional(),
      dialectCode: z.enum(['38','39','40','41']).optional(),
      hasAudio: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(30),
    }))
    .query(async ({ input, ctx }) => {
      return ctx.db.language.searchPuyumaEntries(input);
    }),

  getPuyumaAudioEntry: publicProcedure
    .input(z.object({ entryId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.language.getPuyumaEntryWithAudio(input.entryId);
    }),

  listImportRuns: protectedProcedure
    .input(z.object({ pipelineName: z.string().optional(), status: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      ctx.auth.requirePermission('kb:read');
      return ctx.db.admin.listImportRuns(input);
    }),

  updateReviewTask: protectedProcedure
    .input(z.object({ taskId: z.string(), status: z.string(), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      ctx.auth.requirePermission('kb:review');
      return ctx.db.admin.updateReviewTask(input);
    }),
});
