export type JobStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";

export interface RuntimeJob {
  id: string;
  jobType: string;
  status: JobStatus;
  payload?: Record<string, unknown>;
  createdAt: string;
}

const memoryJobs = new Map<string, RuntimeJob>();

export function enqueueMemoryJob(jobType: string, payload: Record<string, unknown> = {}): RuntimeJob {
  const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const job: RuntimeJob = { id, jobType, status: "queued", payload, createdAt: new Date().toISOString() };
  memoryJobs.set(id, job);
  return job;
}

export function getMemoryJob(id: string): RuntimeJob | undefined {
  return memoryJobs.get(id);
}

export function listMemoryJobs(): RuntimeJob[] {
  return Array.from(memoryJobs.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
