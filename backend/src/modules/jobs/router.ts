import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";
import { enqueueFullCorpusImport } from "../../jobs/fullCorpusImportJob";
import { getMemoryJob, listMemoryJobs } from "../../jobs/jobQueue";

export const jobsRouter = router({
  list: publicProcedure.query(() => ({ items: listMemoryJobs() })),
  get: publicProcedure.input(z.object({ id: z.string() })).query(({ input }) => getMemoryJob(input.id) ?? null),
  enqueueFullCorpusImport: publicProcedure.input(z.object({ minEntries: z.number().int().min(1).default(1000) })).mutation(({ input }) => enqueueFullCorpusImport(input))
});
