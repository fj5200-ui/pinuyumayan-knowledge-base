export async function getLineagePlaceholder(entityType, entityId) {
    // Implementation target: join data_lineage_events, kb_sources, kb_review_tasks and data_quality_findings.
    return {
        entityType,
        entityId,
        sourceIds: [],
        sourcePaths: [],
        qualityStatus: "unknown"
    };
}
