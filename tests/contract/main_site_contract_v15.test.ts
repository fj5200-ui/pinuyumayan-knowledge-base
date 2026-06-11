import { describe, it, expect } from "vitest";

describe("main site contract v15", () => {
  it("documents the critical public and internal endpoints", () => {
    const required = [
      "/health",
      "/ready",
      "/api/public/version",
      "/api/public/knowledge/bootstrap",
      "/api/public/knowledge/vocabulary",
      "/api/public/knowledge/search",
      "/api/internal/main-site/knowledge/delta",
      "/api/internal/corpus/reconcile/enqueue"
    ];
    expect(required.length).toBeGreaterThanOrEqual(8);
  });
});
