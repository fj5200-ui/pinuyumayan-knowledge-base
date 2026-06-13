export const ttsSttMusicV49Endpoints = {
  reviewCenter: "/api/admin/music-speech/v49/review-center",
  releaseValidationReport: "/api/ops/vps/v49/release-validation-report",
  recordReleaseValidation: "/api/internal/vps/v49/record-release-validation",
  recordBackupRestoreDrill: "/api/internal/vps/v49/record-backup-restore-drill",
  liveWorkbench: "/api/admin/music-speech/v49/live-workbench",
  workbenchAction: "/api/internal/speech-training/v49/workbench-action",
  attachmentScanStatus: "/api/internal/speech-training/v49/attachment-scan-status",
  batchProgress: "/api/internal/speech-training/v49/batch-progress",
  searchAutoOptimization: "/api/ops/search/music/v49/auto-optimization",
  applySynonymSuggestion: "/api/internal/search/music/v49/apply-synonym-suggestion",
  recordRegressionRun: "/api/internal/search/music/v49/record-regression-run",
  authorityCitationCompleteness: "/api/ops/authority-sources/v49/citation-completeness",
  approveMetadataOnly: "/api/internal/authority-sources/v49/approve-metadata-only",
  sourceChangeEvent: "/api/internal/authority-sources/v49/source-change-event",
  governanceExport: "/api/ops/speech-training/v49/governance-export",
  exportModelGovernance: "/api/internal/speech-training/v49/export-model-governance",
  siteDesignSystemPerformance: "/api/ops/site/v49/design-system-performance",
  recordPerformanceValidation: "/api/internal/site/v49/record-performance-validation",
  recordOgScreenshotValidation: "/api/internal/site/v49/record-og-screenshot-validation",
  preflightContract: "/api/ops/vps/v49/preflight-contract",
  nextUpgradePlan: "/api/ops/next-upgrade-plan/v50"
} as const;

export type TtsSttMusicV49Endpoint = keyof typeof ttsSttMusicV49Endpoints;
