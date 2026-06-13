import { sql } from "drizzle-orm";
import { likeQuery, toLimit, unwrapRows } from "../../lib/sqlRows";
import { loadStaticBootstrap, staticCommunityProfile, staticRelatedKnowledge, staticSearchKnowledge, staticVocabulary } from "../../repositories/staticKnowledgeRepository";
async function withFallback(action, fallback) {
    if (process.env.KNOWLEDGE_DATA_MODE === "static")
        return fallback();
    try {
        return await action();
    }
    catch {
        return fallback();
    }
}
export async function getBootstrapData(db) {
    return withFallback(async () => {
        const [communitiesResult, factsResult, ritualsResult, vocabStatsResult] = await Promise.all([
            db.execute(sql `SELECT community_key, sort_order, name_zh, romanization, origin_system, administrative_hint, platform_summary FROM vw_public_communities ORDER BY sort_order ASC`),
            db.execute(sql `SELECT id, category, statement_zh, statement_en, visibility, source_ids_json, evidence_hint FROM vw_main_site_bootstrap_facts LIMIT 60`),
            db.execute(sql `SELECT id, name_zh, category, time_hint, summary, communities_json, platform_tags_json, visibility FROM vw_public_ritual_summaries LIMIT 20`),
            db.execute(sql `SELECT dialect_code, dialect_zh, COUNT(*) AS entry_count FROM vw_main_site_vocabulary_audio GROUP BY dialect_code, dialect_zh ORDER BY dialect_code ASC`)
        ]);
        return {
            meta: {
                version: "0.16.0",
                generatedAt: new Date().toISOString(),
                visibility: "public",
                sourcePolicy: "verified_public_or_approved_only"
            },
            communities: unwrapRows(communitiesResult),
            facts: unwrapRows(factsResult),
            rituals: unwrapRows(ritualsResult),
            vocabularyStats: unwrapRows(vocabStatsResult),
            source: "database"
        };
    }, async () => loadStaticBootstrap());
}
export async function searchPublicKnowledge(db, input) {
    return withFallback(async () => {
        const limit = toLimit(input.limit, 20, 50);
        const q = likeQuery(input.q);
        const entityTypes = input.entityTypes?.filter(Boolean) ?? [];
        if (entityTypes.length > 0) {
            const result = await db.execute(sql `
      SELECT id, entity_type, entity_id, title_zh, body_zh, keywords_json, weight, source_ids_json, updated_at
      FROM vw_main_site_search_documents
      WHERE (title_zh LIKE ${q} OR body_zh LIKE ${q})
        AND entity_type IN (${sql.join(entityTypes.map((t) => sql `${t}`), sql `,`)})
      ORDER BY weight DESC, updated_at DESC
      LIMIT ${limit}
    `);
            return { items: unwrapRows(result), limit, source: "database" };
        }
        const result = await db.execute(sql `
    SELECT id, entity_type, entity_id, title_zh, body_zh, keywords_json, weight, source_ids_json, updated_at
    FROM vw_main_site_search_documents
    WHERE title_zh LIKE ${q} OR body_zh LIKE ${q}
    ORDER BY weight DESC, updated_at DESC
    LIMIT ${limit}
  `);
        return { items: unwrapRows(result), limit, source: "database" };
    }, async () => staticSearchKnowledge(input));
}
export async function getRelatedKnowledge(db, input) {
    return withFallback(async () => {
        const limit = toLimit(input.limit, 12, 50);
        const edgesResult = await db.execute(sql `
    SELECT id, subject_type, subject_id, predicate, object_type, object_id, visibility, source_ids_json
    FROM vw_main_site_related_edges
    WHERE subject_type = ${input.entityType} AND subject_id = ${input.entityId}
    LIMIT ${limit}
  `);
        const edges = unwrapRows(edgesResult);
        const searchResult = await db.execute(sql `
    SELECT id, entity_type, entity_id, title_zh, body_zh, keywords_json, weight, source_ids_json, updated_at
    FROM vw_main_site_search_documents
    WHERE entity_type = ${input.entityType} OR entity_id = ${input.entityId}
    ORDER BY weight DESC, updated_at DESC
    LIMIT ${limit}
  `);
        return { edges, items: unwrapRows(searchResult), limit, source: "database" };
    }, async () => staticRelatedKnowledge(input));
}
export async function getCommunityProfile(db, communityKey) {
    return withFallback(async () => {
        const communityResult = await db.execute(sql `
    SELECT community_key, sort_order, name_zh, romanization, origin_system, administrative_hint, platform_summary
    FROM vw_public_communities
    WHERE community_key = ${communityKey}
    LIMIT 1
  `);
        const relatedResult = await db.execute(sql `
    SELECT id, category, statement_zh, statement_en, visibility, source_ids_json, evidence_hint
    FROM vw_main_site_bootstrap_facts
    WHERE JSON_SEARCH(tags_json, 'one', ${communityKey}) IS NOT NULL OR statement_zh LIKE ${likeQuery(communityKey)}
    LIMIT 30
  `);
        return { community: unwrapRows(communityResult)[0] ?? null, relatedFacts: unwrapRows(relatedResult), source: "database" };
    }, async () => staticCommunityProfile(communityKey));
}
export async function listVocabularyAudio(db, input) {
    return withFallback(async () => {
        const limit = toLimit(input.limit, 20, 100);
        const q = likeQuery(input.q);
        const dialectCode = input.dialectCode;
        const categoryKey = input.categoryKey;
        const result = await db.execute(sql `
    SELECT id, corpus_scope, entry_type, dialect_code, dialect_name, dialect_zh, community_key, category_key,
           puyuma_form, zh_tw, en, source_phon, ipa_value, ipa_status,
           source_id, source_path, source_row, source_format, audio_url, mime_type, storage_mode, duration_seconds
    FROM vw_main_site_vocabulary_audio
    WHERE (${dialectCode ?? null} IS NULL OR dialect_code = ${dialectCode ?? null})
      AND (${categoryKey ?? null} IS NULL OR category_key = ${categoryKey ?? null})
      AND (${input.q ?? null} IS NULL OR puyuma_form LIKE ${q} OR zh_tw LIKE ${q} OR en LIKE ${q})
    ORDER BY dialect_code ASC, id ASC
    LIMIT ${limit}
  `);
        return { items: unwrapRows(result), limit, source: "database" };
    }, async () => staticVocabulary(input));
}
export async function getKnowledgeBundle(db, input) {
    const bootstrap = await getBootstrapData(db);
    const vocabulary = input.includeVocabulary
        ? await listVocabularyAudio(db, { limit: toLimit(input.vocabularyLimit, 80, 500) })
        : { items: [], limit: 0 };
    return {
        meta: { version: "0.16.0", generatedAt: new Date().toISOString(), visibility: "main_site_internal" },
        ...bootstrap,
        vocabulary: vocabulary.items
    };
}
export async function getDeltaSince(db, input) {
    const limit = toLimit(input.limit, 100, 1000);
    const result = await db.execute(sql `
    SELECT entity_type, entity_id, change_type, version_no, created_at
    FROM kb_content_versions
    WHERE created_at > ${input.since}
    ORDER BY created_at ASC
    LIMIT ${limit}
  `);
    return { items: unwrapRows(result), limit, since: input.since, nextCursor: new Date().toISOString() };
}
