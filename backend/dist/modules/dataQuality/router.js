import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";
export const dataQualityRouter = router({
    runGate: publicProcedure
        .input(z.object({ gateKey: z.string().min(1), releaseChannel: z.string().default("public") }))
        .mutation(async ({ input }) => {
        // Implementation target: require quality:run and write data_quality_gate_results_v14.
        return { status: "queued", gateKey: input.gateKey, releaseChannel: input.releaseChannel };
    })
});
