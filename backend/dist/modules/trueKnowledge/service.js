import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd().endsWith('/backend') ? path.resolve(process.cwd(), '..') : process.cwd();
async function readJson(rel) {
    const raw = await fs.readFile(path.join(root, rel), 'utf8');
    return JSON.parse(raw);
}
export async function listTrueKnowledgeSourcesV20() {
    return readJson('data/sources/true_source_registry_v20.json');
}
export async function listTrueKnowledgeClaimsV20() {
    return readJson('data/content/source_grounded_claims_v20_additions.json');
}
export async function listFrontendSourcePacketsV20() {
    return readJson('data/ai/frontend_source_packets_v20.json');
}
export async function getNextUpgradePlanV21() {
    return readJson('data/development/next_upgrade_plan_v21.json');
}
export function checkDraftDuplicateV20(input) {
    // Placeholder deterministic check. Production implementation should query article_no_duplicate_memory_v20.
    const claimSet = (input.claimIds || []).slice().sort().join('|');
    const slug = input.slug || '';
    const title = input.title || '';
    return {
        ok: true,
        decision: 'pass_or_manual_review_after_db_check',
        draftFingerprintInput: { slug, claimSet, title },
        requiredChecks: ['same_slug', 'same_claim_set_hash', 'claim_overlap_ratio_gte_0_72', 'same_topic_within_10_days', 'sensitive_claim_without_guardrail']
    };
}
