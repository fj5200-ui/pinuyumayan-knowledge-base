export interface SearchParams {
  q: string;
  limit?: number;
  cursor?: string;
  facets?: Record<string, string>;
}

export interface SearchSuggestion {
  text: string;
  kind: "community" | "ritual" | "vocabulary" | "topic" | "alias";
}

export async function suggestKnowledgeTerms(query: string): Promise<SearchSuggestion[]> {
  const q = query.trim();
  if (!q) return [];
  // Replace with DB-backed search_synonyms + kb_search_documents query.
  return [
    { text: q, kind: "topic" },
    { text: `${q} 卑南族`, kind: "alias" }
  ];
}

export async function searchKnowledge(_params: SearchParams) {
  // Implementation target: query vw_main_site_search_documents and search_synonyms.
  return { items: [], nextCursor: null, facets: {} };
}
