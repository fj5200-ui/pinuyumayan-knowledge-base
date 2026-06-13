import { router, publicProcedure } from "../../trpc/init";
export const versioningRouter = router({
    current: publicProcedure.query(() => ({
        apiVersion: "2026-06-11",
        service: "pinuyumayan-backend-database",
        supportedVersions: ["2026-06-11"],
        previewCorpusEntries: 80,
        fullCorpusImportAtStartup: false
    }))
});
