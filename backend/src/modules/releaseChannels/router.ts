import { router, publicProcedure } from "../../trpc/root";
import { listReleaseChannels } from "./service";

export const releaseChannelsRouter = router({
  listPublic: publicProcedure.query(() => {
    return { ok: true, data: listReleaseChannels() };
  })
});

