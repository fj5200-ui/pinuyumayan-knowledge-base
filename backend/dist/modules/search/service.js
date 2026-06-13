export async function suggestKnowledgeTerms(query) {
    const q = query.trim();
    if (!q)
        return [];
    // Replace with DB-backed search_synonyms + kb_search_documents query.
    return [
        { text: q, kind: "topic" },
        { text: `${q} 卑南族`, kind: "alias" }
    ];
}
export async function searchKnowledge(_params) {
    // Implementation target: query vw_main_site_search_documents and search_synonyms.
    return { items: [], nextCursor: null, facets: {} };
}
