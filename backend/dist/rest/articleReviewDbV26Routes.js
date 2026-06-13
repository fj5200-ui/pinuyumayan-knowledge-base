import { ok, fail } from "../lib/apiResponse";
import { execute, queryRows } from "../lib/dbQuery";
import { getAdminFromRequest } from "../security/adminSessionV26";
const NEXT_STATE = {
    approve: "approved_for_schedule",
    reject: "rejected",
    request_revision: "needs_revision",
    schedule: "scheduled",
    cancel_schedule: "approved_for_schedule",
    archive: "archived",
    merge_duplicate: "rejected_duplicate"
};
const FORBIDDEN = ["卑南文化遺址", "卑南遺址", "卑南考古遺址", "卑南文化公園", "Beinan Site", "Peinan Site", "Peinan Archaeological Site"];
function checkForbidden(input) {
    const text = JSON.stringify(input ?? {});
    return FORBIDDEN.filter(term => text.includes(term));
}
export function registerArticleReviewDbV26Routes(app) {
    app.post("/api/admin/articles/v26/review-action", async (req, res) => {
        const { draftId, action, reason, publishAt, checks } = req.body ?? {};
        if (!draftId || !action)
            return fail(res, 400, "BAD_REQUEST", "draftId and action are required");
        if (!NEXT_STATE[action])
            return fail(res, 400, "BAD_REQUEST", "Unsupported review action");
        const forbiddenTerms = checkForbidden(req.body);
        if ((action === "approve" || action === "schedule") && forbiddenTerms.length) {
            return fail(res, 400, "VALIDATION_ERROR", "Forbidden Beinan/Peinan archaeology relation must be removed before approval", { forbiddenTerms });
        }
        try {
            const admin = await getAdminFromRequest(req);
            if (!admin)
                return fail(res, 401, "ADMIN_UNAUTHORIZED", "Admin session is required");
            const nextState = NEXT_STATE[action];
            await execute(`INSERT INTO article_review_transactions_v26 (draft_id, action, next_state, reviewer_admin_user_id, reason, publish_at, checks_json)
         VALUES (?, ?, ?, ?, ?, ?, CAST(? AS JSON))`, [draftId, action, nextState, admin.id, reason ?? null, publishAt ?? null, JSON.stringify(checks ?? {})]);
            await execute(`INSERT INTO article_review_audit_v26 (draft_id, event_type, actor_admin_user_id, metadata_json, request_id)
         VALUES (?, ?, ?, CAST(? AS JSON), ?)`, [draftId, `review.${action}`, admin.id, JSON.stringify({ reason: reason ?? null, publishAt: publishAt ?? null, forbiddenTerms }), req.requestId ?? null]);
            if (action === "schedule") {
                await execute(`INSERT INTO content_publish_queue (content_item_id, action, scheduled_at, status, metadata_json)
           VALUES (?, 'publish', ?, 'scheduled', CAST(? AS JSON))`, [draftId, publishAt ?? null, JSON.stringify({ source: "articleReviewDbV26", reviewerAdminUserId: admin.id })]).catch(() => null);
            }
            return ok(res, { version: "v26", draftId, action, nextState, persisted: true, forbiddenTerms });
        }
        catch (error) {
            return fail(res, 503, "DB_UNAVAILABLE", error instanceof Error ? error.message : "DB unavailable");
        }
    });
    app.get("/api/admin/articles/v26/review-transactions", async (req, res) => {
        try {
            const admin = await getAdminFromRequest(req);
            if (!admin)
                return fail(res, 401, "ADMIN_UNAUTHORIZED", "Admin session is required");
            const rows = await queryRows(`SELECT * FROM article_review_transactions_v26 ORDER BY created_at DESC LIMIT 100`);
            return ok(res, { version: "v26", rows });
        }
        catch (error) {
            return fail(res, 503, "DB_UNAVAILABLE", error instanceof Error ? error.message : "DB unavailable");
        }
    });
}
