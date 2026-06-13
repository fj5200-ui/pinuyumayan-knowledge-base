export const ttsSttMusicV56Client = {
  reviewCenter: "/api/admin/music-speech/v56/review-center",
  immutableReleaseEvidence: "/api/ops/vps/v56/immutable-release-evidence",
  legalRealExport: "/api/admin/speech-training/v56/legal-real-export",
  postRolloutMonitoring: "/api/ops/search/music/v56/post-rollout-monitoring",
  authorityPublicRecords: "/api/ops/authority-sources/v56/public-records",
  governanceDownloadAudit: "/api/ops/speech-training/v56/governance-download-audit",
  operationsCadence: "/api/ops/site/v56/operations-cadence",
  preflight: "/api/ops/vps/v56/preflight-contract",
};
export type TtsSttMusicV56Endpoint = keyof typeof ttsSttMusicV56Client;
