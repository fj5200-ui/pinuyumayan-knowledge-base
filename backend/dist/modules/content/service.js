import { sql } from "drizzle-orm";
import { unwrapRows } from "../../lib/sqlRows";
import { staticContentBySlug, staticContentCollections, staticLearningSets } from "../../repositories/staticKnowledgeRepository";
async function tryDb(action, fallback) {
    if (process.env.KNOWLEDGE_DATA_MODE === "static")
        return fallback();
    try {
        return await action();
    }
    catch {
        return fallback();
    }
}
export async function listContentCollections(db, channel = "public") {
    return tryDb(async () => {
        const result = await db.execute(sql `
      SELECT id, slug, title_zh, description_zh, item_slugs_json, release_channel, updated_at
      FROM public_content_collections_v16
      WHERE release_channel = ${channel}
      ORDER BY slug ASC
    `);
        return { ok: true, source: "database", channel, collections: unwrapRows(result) };
    }, () => staticContentCollections(channel));
}
export async function getContentItemBySlug(db, slug) {
    return tryDb(async () => {
        const result = await db.execute(sql `
      SELECT id, slug, entity_type, entity_id, title_zh, summary_zh, body_zh, keywords_json,
             source_ids_json, release_channel, review_status, sensitivity, sort_order, sections_json, updated_at
      FROM vw_public_content_cards_v16
      WHERE slug = ${slug}
      LIMIT 1
    `);
        const item = unwrapRows(result)[0] ?? null;
        return { ok: Boolean(item), source: "database", slug, item };
    }, () => staticContentBySlug(slug));
}
export async function listVocabularyLearningSets() {
    const items = await staticLearningSets();
    return { ok: true, source: "static_json_v16", items };
}
