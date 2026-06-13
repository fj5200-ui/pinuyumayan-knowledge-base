import { router, publicProcedure } from "../../trpc/init";
export const runtimeRouter = router({
    status: publicProcedure.query(() => ({
        ok: true,
        version: "v10",
        fullCorpusImportAtStartup: false,
        mainSitePullEnabled: true
    }))
});
