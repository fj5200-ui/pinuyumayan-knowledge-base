export interface LineageLookupResult {
  entityType: string;
  entityId: string;
  sourceIds: string[];
  sourcePaths: string[];
  importRunId?: string;
  releaseBatchId?: string;
  qualityStatus: "unknown" | "passed" | "warning" | "blocked";
}

export async function getLineagePlaceholder(entityType: string, entityId: string): Promise<LineageLookupResult> {
  // Implementation target: join data_lineage_events, kb_sources, kb_review_tasks and data_quality_findings.
  return {
    entityType,
    entityId,
    sourceIds: [],
    sourcePaths: [],
    qualityStatus: "unknown"
  };
}

