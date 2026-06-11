import { router } from "./init";
import { communitiesRouter } from "../modules/communities/router";
import { factsRouter } from "../modules/facts/router";
import { vocabularyRouter } from "../modules/vocabulary/router";
import { reviewRouter } from "../modules/review/router";
import { importsRouter } from "../modules/imports/router";
import { searchRouter } from "../modules/search/router";
import { mainSiteKnowledgeRouter } from "../modules/mainSiteKnowledge/router";
import { runtimeRouter } from "../modules/runtime/router";
import { jobsRouter } from "../modules/jobs/router";
import { syncRouter } from "../modules/sync/router";
import { exportsRouter } from "../modules/exports/router";
import { versioningRouter } from "../modules/versioning/router";
import { adminAuthRouter } from "../modules/adminAuth/router";
import { adminSyncRouter } from "../modules/adminSync/router";
import { contentRouter } from "../modules/content/router";

export const appRouter = router({
  communities: communitiesRouter,
  facts: factsRouter,
  vocabulary: vocabularyRouter,
  review: reviewRouter,
  imports: importsRouter,
  search: searchRouter,
  mainSiteKnowledge: mainSiteKnowledgeRouter,
  runtime: runtimeRouter,
  jobs: jobsRouter,
  versioning: versioningRouter,
  exports: exportsRouter,
  sync: syncRouter,
  adminAuth: adminAuthRouter,
  adminSync: adminSyncRouter,
  content: contentRouter,
});

export type AppRouter = typeof appRouter;
