import type { Express } from "express";
import { ok, fail } from "../lib/apiResponse";
import { requireInternalApiKey } from "../security/apiKeyAuth";
import { enqueueFullCorpusImport } from "../jobs/fullCorpusImportJob";
import { getMemoryJob, listMemoryJobs } from "../jobs/jobQueue";

export function registerJobsRoutes(app: Express) {
  app.get("/api/ops/jobs", (_req, res) => ok(res, { items: listMemoryJobs() }));

  app.post("/api/internal/jobs/full-corpus/enqueue", requireInternalApiKey, (req, res) => {
    const minEntries = Number(req.body?.minEntries ?? req.query.minEntries ?? 1000);
    const job = enqueueFullCorpusImport({ minEntries, download: true });
    return ok(res, job, 202);
  });

  app.get("/api/internal/jobs/:jobId", requireInternalApiKey, (req, res) => {
    const job = getMemoryJob(req.params.jobId);
    if (!job) return fail(res, 404, "NOT_FOUND", "Job not found");
    return ok(res, job);
  });
}
