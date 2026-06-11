import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";

export const exportsRouter = router({
  latest: publicProcedure
    .input(z.object({ type: z.string().default("main_site_bootstrap") }).optional())
    .query(({ input }) => ({
      bundleType: input?.type ?? "main_site_bootstrap",
      status: "not_generated_in_skeleton",
      fullCorpusImportAtStartup: false
    }))
});
