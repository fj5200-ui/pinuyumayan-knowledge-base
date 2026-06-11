import { enqueueMemoryJob } from "./jobQueue";

export function enqueueFullCorpusImport(options: { minEntries?: number; download?: boolean } = {}) {
  return enqueueMemoryJob("full_corpus_import", {
    minEntries: options.minEntries ?? 1000,
    download: options.download ?? true,
    note: "Queue placeholder. Production implementation should persist to job_queue and run scripts/deploy_full_corpus_import.py in a worker."
  });
}
