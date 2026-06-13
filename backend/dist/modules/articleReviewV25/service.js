export function getReviewWorkbenchV25() {
    return {
        version: "v25",
        queues: ["draft_submitted", "needs_revision", "duplicate_blocked", "citation_fix_required", "sensitivity_review", "approved_for_schedule", "scheduled"],
        visibleChecks: ["citation", "duplicate", "forbidden_relation", "sensitivity", "license", "seo", "cooldown"],
        forbiddenRelationTerms: ["卑南文化遺址", "卑南遺址", "Beinan Site", "Peinan Site", "Peinan Archaeological Site"]
    };
}
export function applyReviewActionV25(input) {
    const action = input.action;
    if (!input.draftId)
        return { ok: false, error: { code: "missing_draft_id", message: "draftId is required" } };
    if (!action)
        return { ok: false, error: { code: "missing_action", message: "action is required" } };
    const nextStateByAction = {
        approve: "approved_for_schedule",
        reject: "rejected",
        request_revision: "needs_revision",
        schedule: "scheduled",
        merge_duplicate: "rejected"
    };
    return {
        ok: true,
        version: "v25",
        draftId: input.draftId,
        action,
        nextState: nextStateByAction[action] ?? "manual_review",
        publishAt: action === "schedule" ? input.publishAt ?? null : null,
        auditRequired: true
    };
}
export function runSeoPublishCheckV25(input) {
    const title = String(input?.title ?? "");
    const description = String(input?.description ?? "");
    const text = `${title}\n${description}\n${input?.body ?? ""}`;
    const forbidden = ["卑南文化遺址", "卑南遺址", "Beinan Site", "Peinan Site", "Peinan Archaeological Site"].filter(t => text.includes(t));
    const findings = [];
    if (!input?.slug)
        findings.push("missing_slug");
    if (title.length > 64)
        findings.push("title_too_long");
    if (description.length > 155)
        findings.push("description_too_long");
    if (!input?.canonicalUrl)
        findings.push("missing_canonical_url");
    if (!input?.ogImage)
        findings.push("missing_og_image");
    if (forbidden.length)
        findings.push("forbidden_beinan_archaeology_relation");
    return { ok: true, version: "v25", passed: findings.length === 0, findings, forbiddenTerms: forbidden };
}
