export type TtsSttMusicClientV47Options = { baseUrl: string; internalHeaders?: Record<string, string> };
async function getJson(baseUrl: string, path: string, headers?: Record<string, string>) { const res = await fetch(`${baseUrl}${path}`, { headers }); if (!res.ok) throw new Error(`${path} ${res.status}`); return res.json(); }
async function postJson(baseUrl: string, path: string, body: unknown, headers?: Record<string, string>) { const res = await fetch(`${baseUrl}${path}`, { method: "POST", headers: { "content-type": "application/json", ...(headers ?? {}) }, body: JSON.stringify(body ?? {}) }); if (!res.ok) throw new Error(`${path} ${res.status}: ${await res.text()}`); return res.json(); }
export function createTtsSttMusicClientV47(options: TtsSttMusicClientV47Options) {
  const baseUrl = options.baseUrl.replace(/\/$/, "");
  const h = options.internalHeaders;
  return {
    reviewCenter: () => getJson(baseUrl, "/api/admin/music-speech/v47/review-center"),
    reviewActionUi: () => getJson(baseUrl, "/api/ops/speech-training/v47/review-action-ui"),
    issueHmacNonce: (userId: string, purpose = "speech_review_write") => getJson(baseUrl, `/api/internal/speech-training/v47/hmac-nonce?user_id=${encodeURIComponent(userId)}&purpose=${encodeURIComponent(purpose)}`, h),
    uploadEvidenceRecord: (body: unknown) => postJson(baseUrl, "/api/internal/speech-training/v47/upload-evidence-record", body, h),
    reviewAction: (body: unknown) => postJson(baseUrl, "/api/internal/speech-training/v47/review-action", body, h),
    transactionTests: () => getJson(baseUrl, "/api/ops/database/v47/transaction-tests"),
    runTransactionTest: (body: unknown) => postJson(baseUrl, "/api/internal/database/v47/run-transaction-test", body, h),
    searchObservability: () => getJson(baseUrl, "/api/ops/search/music/v47/observability-dashboard"),
    logSearchQuery: (body: unknown) => postJson(baseUrl, "/api/internal/search/music/v47/query-log", body, h),
    authorityAdapters: () => getJson(baseUrl, "/api/ops/authority-sources/v47/fetch-adapters"),
    authorityLiveFetchRun: (body: unknown) => postJson(baseUrl, "/api/internal/authority-sources/v47/live-fetch-run", body, h),
    authorityCandidateReview: (body: unknown) => postJson(baseUrl, "/api/internal/authority-sources/v47/candidate-review", body, h),
    modelGovernanceReport: () => getJson(baseUrl, "/api/ops/speech-training/v47/governance-report"),
    modelGovernanceDecision: (body: unknown) => postJson(baseUrl, "/api/internal/speech-training/v47/model-governance-decision", body, h),
    sitePolish: () => getJson(baseUrl, "/api/ops/site/v47/polish-contract"),
    vpsPreflight: () => getJson(baseUrl, "/api/ops/vps/v47/preflight-contract"),
    nextPlan: () => getJson(baseUrl, "/api/ops/next-upgrade-plan/v48"),
  };
}
