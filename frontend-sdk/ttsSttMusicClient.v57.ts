export const ttsSttMusicV57Client = {
  reviewCenter: "/api/admin/music-speech/v57/review-center",
  releaseEvidenceLedgerSeal: "/api/ops/vps/v57/release-evidence-ledger-seal",
  legalTrainDevTest: "/api/admin/speech-training/v57/legal-train-dev-test",
  search2472Decision: "/api/ops/search/music/v57/2472-decision",
  authorityEvidenceArchive: "/api/ops/authority-sources/v57/evidence-archive",
  governanceAuditQuery: "/api/ops/speech-training/v57/governance-audit-query",
  operationsReportNotifications: "/api/ops/site/v57/report-notifications",
  preflight: "/api/ops/vps/v57/preflight-contract",
};
export type TtsSttMusicV57Endpoint = keyof typeof ttsSttMusicV57Client;
