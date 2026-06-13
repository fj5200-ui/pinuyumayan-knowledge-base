const memoryJobs = new Map();
export function enqueueMemoryJob(jobType, payload = {}) {
    const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const job = { id, jobType, status: "queued", payload, createdAt: new Date().toISOString() };
    memoryJobs.set(id, job);
    return job;
}
export function getMemoryJob(id) {
    return memoryJobs.get(id);
}
export function listMemoryJobs() {
    return Array.from(memoryJobs.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
