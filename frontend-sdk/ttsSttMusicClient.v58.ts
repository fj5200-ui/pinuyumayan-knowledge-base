export const ttsSttMusicV58Client = {
  reviewCenter: "/api/admin/music-speech/v58/review-center",
  releaseCertificateSealed: "/api/ops/vps/v58/release-certificate-sealed",
  datasetV58: "/api/admin/speech-training/v58/dataset-v58",
  searchFormalConfig: "/api/ops/search/music/v58/formal-config",
  authorityAuditSeal: "/api/ops/authority-sources/v58/audit-seal",
  governanceRbacDownload: "/api/ops/speech-training/v58/governance-rbac-download",
  operationsLiveDelivery: "/api/ops/site/v58/live-delivery",
  preflight: "/api/ops/vps/v58/preflight-contract",
};
export type TtsSttMusicV58Endpoint = keyof typeof ttsSttMusicV58Client;
