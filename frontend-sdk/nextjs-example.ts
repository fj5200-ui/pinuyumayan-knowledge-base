import { PinuyumayanKnowledgeClient } from "./pinuyumayanKnowledgeClient";

const kb = new PinuyumayanKnowledgeClient({
  baseUrl: process.env.PINUYUMAYAN_KB_API_URL!,
  apiKey: process.env.PINUYUMAYAN_MAIN_SITE_API_KEY
});

export async function getHomeKnowledge() {
  // Use this in Next.js server components or route handlers.
  return kb.bootstrap();
}

export async function getArticleRelatedKnowledge(entityType: string, entityId: string) {
  return kb.related(entityType, entityId, 12);
}

export async function getPuyumaVocabularyForPage(dialectCode?: string) {
  return kb.vocabulary({ dialectCode, limit: 50 });
}
