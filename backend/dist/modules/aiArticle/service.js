import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
const rootDir = path.resolve(process.cwd(), "..");
const dataDir = path.join(rootDir, "data");
function normalize(input) {
    return input.toLowerCase()
        .replace(/[\s\u3000]+/g, "")
        .replace(/[，。！？、；：「」『』（）()\[\]{}《》〈〉,.!?;:'"`~\-—_/\\|]/g, "");
}
function sha(input) {
    return createHash("sha256").update(input).digest("hex");
}
async function loadJson(relativePath) {
    const raw = await readFile(path.join(dataDir, relativePath), "utf8");
    return JSON.parse(raw);
}
export async function listSourcePackets(query) {
    const [sources, claims] = await Promise.all([
        loadJson("sources/official_source_registry_v18.json"),
        loadJson("content/source_grounded_claims_v18.json")
    ]);
    const q = normalize(query ?? "");
    const filtered = !q ? claims.claims : claims.claims.filter((claim) => {
        const hay = normalize([claim.category, claim.statement_zh, ...(claim.keywords ?? [])].join(" "));
        return hay.includes(q);
    });
    return {
        sources: sources.sources,
        claims: filtered,
        counts: { sources: sources.sources.length, claims: filtered.length },
        guardrail: "Use claims as source-grounded facts. User ideas may shape angle, not create historical facts."
    };
}
export async function listArticleBlueprints() {
    return loadJson("ai/article_blueprints_v18.json");
}
export async function buildDraftPlan(input) {
    const blueprints = await loadJson("ai/article_blueprints_v18.json");
    const claimsFile = await loadJson("content/source_grounded_claims_v18.json");
    const blueprint = blueprints.blueprints.find((x) => x.blueprint_id === input.blueprintId);
    if (!blueprint) {
        return { ok: false, error: { code: "BLUEPRINT_NOT_FOUND", message: "Unknown article blueprint" } };
    }
    const claims = claimsFile.claims.filter((claim) => blueprint.required_claim_ids.includes(claim.claim_id));
    const title = input.preferredTitle?.trim() || blueprint.title_zh;
    const slug = blueprint.slug;
    const claimSetHash = sha(blueprint.required_claim_ids.slice().sort().join("|"));
    const fingerprint = sha([normalize(title), normalize(slug), claimSetHash, normalize(blueprint.angle)].join("|"));
    return {
        ok: true,
        draftPlan: {
            draftId: `draft_${fingerprint.slice(0, 16)}`,
            blueprintId: blueprint.blueprint_id,
            titleZh: title,
            slug,
            angleZh: blueprint.angle,
            userIdeaSummary: input.idea?.trim() || "",
            status: "draft_needs_human_review",
            publicAutoPublish: false,
            canonicalFingerprint: `article_${fingerprint.slice(0, 24)}`,
            sourceClaimSetHash: claimSetHash,
            requiredClaims: claims.map((claim) => ({
                claimId: claim.claim_id,
                statementZh: claim.statement_zh,
                sourceIds: claim.source_ids,
                evidenceLocator: claim.evidence_locator,
                sensitivity: claim.sensitivity,
                publicUse: claim.public_use,
                guardrail: claim.article_guardrail
            })),
            suggestedOutline: [
                "開頭：用管理者想法說明為什麼要談這個主題，但不可把想法當史實。",
                "史料段落：每一個歷史/文化陳述都引用 requiredClaims。",
                "平台段落：連回主站資料卡、語詞卡、真人音檔或十社頁面。",
                "尊重段落：說明公開摘要限制與資料更新/審核機制。"
            ],
            prohibited: blueprint.prohibited,
            mustRunBeforePublish: ["duplicate-check", "citation-check", "sensitivity-check", "human-review"]
        }
    };
}
export function duplicateCheck(input) {
    const titleHash = sha(normalize(input.title));
    const slugHash = sha(normalize(input.slug));
    const claimSetHash = sha((input.sourceClaimIds ?? []).slice().sort().join("|"));
    const canonicalFingerprint = `article_${sha([titleHash, slugHash, claimSetHash].join("|")).slice(0, 24)}`;
    const duplicate = (input.existingFingerprints ?? []).includes(canonicalFingerprint);
    return {
        duplicate,
        decision: duplicate ? "block" : "allow_for_review",
        canonicalFingerprint,
        titleHash,
        slugHash,
        sourceClaimSetHash: claimSetHash,
        rulesApplied: ["same_slug", "same_canonical_fingerprint", "same_source_claim_set"],
        note: duplicate ? "Candidate matches an existing fingerprint." : "No exact fingerprint match supplied; still requires semantic review before publish."
    };
}
export function publishCheck(input) {
    const draft = input.draftPlan ?? {};
    const blockers = [];
    if (draft.publicAutoPublish === true)
        blockers.push("public_auto_publish_is_not_allowed");
    if (!Array.isArray(draft.requiredClaims) || draft.requiredClaims.length < 3)
        blockers.push("minimum_3_source_claims_required");
    if (!draft.canonicalFingerprint)
        blockers.push("canonical_fingerprint_required");
    const sensitive = (draft.requiredClaims ?? []).filter((x) => x.sensitivity !== "low");
    return {
        okToPublish: blockers.length === 0 ? false : false,
        status: blockers.length ? "blocked" : "needs_human_review",
        blockers,
        reviewerRequired: true,
        sensitivitySummary: { sensitiveClaims: sensitive.length, rule: "medium/high sensitivity remains public_summary_only" },
        note: "v18 never publishes directly. Passing checks means ready for human/cultural review, not automatic publication."
    };
}
