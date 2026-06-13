export type V48Json = Record<string, unknown>;

export class TtsSttMusicClientV48 {
  constructor(private readonly baseUrl = "") {}
  private async get<T = V48Json>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`);
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return res.json() as Promise<T>;
  }
  private async post<T = V48Json>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
    return res.json() as Promise<T>;
  }
  reviewCenter() { return this.get("/api/admin/music-speech/v48/review-center"); }
  dbValidationReport() { return this.get("/api/ops/vps/v48/db-validation-report"); }
  workbench() { return this.get("/api/admin/music-speech/v48/workbench"); }
  searchAnalytics() { return this.get("/api/ops/search/music/v48/analytics-dashboard"); }
  authorityMergeDashboard() { return this.get("/api/ops/authority-sources/v48/candidate-merge-dashboard"); }
  modelVisualization() { return this.get("/api/ops/speech-training/v48/model-visualization"); }
  visualCompletion() { return this.get("/api/ops/site/v48/visual-completion"); }
  nextPlan() { return this.get("/api/ops/next-upgrade-plan/v49"); }
  bulkReviewAction(body: unknown) { return this.post("/api/internal/speech-training/v48/bulk-review-action", body); }
  mergeDecision(body: unknown) { return this.post("/api/internal/authority-sources/v48/merge-decision", body); }
}
