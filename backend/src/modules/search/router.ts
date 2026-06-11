import { z } from "zod";
import { router, publicProcedure } from "../../trpc/root";
import { searchKnowledge, suggestKnowledgeTerms } from "./service";

export const searchRouter = router({
  suggest: publicProcedure
    .input(z.object({ q: z.string().min(1).max(128) }))
    .query(({ input }) => suggestKnowledgeTerms(input.q)),
  search: publicProcedure
    .input(z.object({ q: z.string().min(1).max(256), limit: z.number().min(1).max(100).default(20), cursor: z.string().optional() }))
    .query(({ input }) => searchKnowledge(input))
});
