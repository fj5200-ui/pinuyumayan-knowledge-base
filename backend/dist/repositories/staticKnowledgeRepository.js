import { readFile } from "node:fs/promises";
import path from "node:path";
const cache = new Map();
function projectRoot() {
    return process.env.PINUYUMAYAN_PROJECT_ROOT || path.resolve(process.cwd(), "..");
}
async function readJson(relativePath) {
    const absolute = path.join(projectRoot(), relativePath);
    const stateless = process.env.PINUYUMAYAN_DISABLE_STATIC_JSON_CACHE === "true";
    if (!stateless && cache.has(absolute))
        return cache.get(absolute);
    const parsed = JSON.parse(await readFile(absolute, "utf8"));
    if (!stateless)
        cache.set(absolute, parsed);
    return parsed;
}
function textIncludes(value, q) {
    return String(value ?? "").toLocaleLowerCase().includes(q.toLocaleLowerCase());
}
function toLimit(value, fallback, max) {
    const n = Number(value ?? fallback);
    if (!Number.isFinite(n))
        return fallback;
    return Math.max(1, Math.min(max, Math.floor(n)));
}
export async function loadStaticBootstrap() {
    return readJson("data/integration/main_site_static_bootstrap_bundle_v16.json");
}
export async function loadStaticCards() {
    const payload = await readJson("data/content/public_knowledge_cards_v16.json");
    return payload.items;
}
export async function loadStaticCollections() {
    const payload = await readJson("data/content/public_content_collections_v16.json");
    return payload.items;
}
export async function loadStaticSearchDocuments() {
    const payload = await readJson("data/search/public_search_documents_v16.json");
    return payload.documents;
}
export async function loadStaticVocabularyEntries() {
    const payload = await readJson("data/web/puyuma_vocabulary_audio_entries.json");
    return payload.entries;
}
export async function staticSearchKnowledge(input) {
    const q = String(input.q ?? "").trim();
    const limit = toLimit(input.limit, 20, 100);
    let docs = await loadStaticSearchDocuments();
    const entityTypes = input.entityTypes?.filter(Boolean) ?? [];
    if (entityTypes.length)
        docs = docs.filter((item) => entityTypes.includes(item.entity_type));
    if (q) {
        docs = docs.filter((item) => textIncludes(item.title_zh, q) || textIncludes(item.body_zh, q) || (item.keywords ?? []).some((kw) => textIncludes(kw, q)));
    }
    docs = docs.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
    return { items: docs.slice(0, limit), limit, source: "static_json_v16" };
}
export async function staticVocabulary(input) {
    const limit = toLimit(input.limit, 20, 500);
    let rows = await loadStaticVocabularyEntries();
    if (input.dialectCode)
        rows = rows.filter((row) => row.language?.dialect_code === input.dialectCode);
    if (input.categoryKey)
        rows = rows.filter((row) => row.category?.website_category_key === input.categoryKey);
    const q = String(input.q ?? "").trim();
    if (q)
        rows = rows.filter((row) => textIncludes(row.text?.puyuma_form, q) || textIncludes(row.text?.zh_tw, q) || textIncludes(row.text?.en, q));
    return { items: rows.slice(0, limit), limit, source: "static_json_v16" };
}
export async function staticCommunityProfile(communityKey) {
    const bootstrap = await loadStaticBootstrap();
    const community = (bootstrap.communities ?? []).find((item) => item.key === communityKey || item.community_key === communityKey) ?? null;
    const docs = await loadStaticSearchDocuments();
    const relatedFacts = docs.filter((doc) => doc.entity_type === "community" && doc.entity_id === communityKey || (doc.keywords ?? []).includes(communityKey)).slice(0, 30);
    return { community, relatedFacts, source: "static_json_v16" };
}
export async function staticRelatedKnowledge(input) {
    const limit = toLimit(input.limit, 12, 50);
    const docs = await loadStaticSearchDocuments();
    const items = docs.filter((doc) => doc.entity_type === input.entityType || doc.entity_id === input.entityId || doc.slug.includes(input.entityId)).slice(0, limit);
    return { edges: [], items, limit, source: "static_json_v16" };
}
export async function staticContentCollections(channel = "public") {
    const collections = (await loadStaticCollections()).filter((item) => item.release_channel === channel || channel === "all");
    return { ok: true, source: "static_json_v16", channel, collections };
}
export async function staticContentBySlug(slug) {
    const cards = await loadStaticCards();
    const item = cards.find((card) => card.slug === slug) ?? null;
    return { ok: Boolean(item), source: "static_json_v16", slug, item };
}
export async function staticLearningSets() {
    const payload = await readJson("data/content/vocabulary_learning_sets_v16.json");
    return payload.items;
}
