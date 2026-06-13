import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";
import { getBootstrapData, getCommunityProfile, getDeltaSince, getKnowledgeBundle, getRelatedKnowledge, listVocabularyAudio, searchPublicKnowledge } from "./service";
export const mainSiteKnowledgeRouter = router({
    bootstrap: publicProcedure
        .query(async ({ ctx }) => getBootstrapData(ctx.db)),
    search: publicProcedure
        .input(z.object({
        q: z.string().min(1),
        limit: z.number().min(1).max(50).default(20),
        entityTypes: z.array(z.string()).optional()
    }))
        .query(async ({ ctx, input }) => searchPublicKnowledge(ctx.db, input)),
    related: publicProcedure
        .input(z.object({
        entityType: z.string().min(1),
        entityId: z.string().min(1),
        limit: z.number().min(1).max(50).default(12)
    }))
        .query(async ({ ctx, input }) => getRelatedKnowledge(ctx.db, input)),
    community: publicProcedure
        .input(z.object({ communityKey: z.string().min(1) }))
        .query(async ({ ctx, input }) => getCommunityProfile(ctx.db, input.communityKey)),
    vocabulary: publicProcedure
        .input(z.object({
        dialectCode: z.string().optional(),
        categoryKey: z.string().optional(),
        q: z.string().optional(),
        limit: z.number().min(1).max(100).default(20)
    }).default({ limit: 20 }))
        .query(async ({ ctx, input }) => listVocabularyAudio(ctx.db, input)),
    bundle: publicProcedure
        .input(z.object({ includeVocabulary: z.boolean().default(true), vocabularyLimit: z.number().min(1).max(500).default(80) }).default({ includeVocabulary: true, vocabularyLimit: 80 }))
        .query(async ({ ctx, input }) => getKnowledgeBundle(ctx.db, input)),
    delta: publicProcedure
        .input(z.object({ since: z.string().min(1), limit: z.number().min(1).max(1000).default(100) }))
        .query(async ({ ctx, input }) => getDeltaSince(ctx.db, input))
});
