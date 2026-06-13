import { router, publicProcedure } from "../../trpc/init";
import { listReleaseChannels } from "./service";

export const releaseChannelsRouter = router({
  listPublic: publicProcedure.query(() => {
    return { ok: true, data: listReleaseChannels() };
  })
});

