import { readFile } from "node:fs/promises";
import path from "node:path";

export interface StaticKnowledgeCard {
  id: string;
  slug: string;
  entity_type: string;
  entity_id: string;
  title_zh: string;
  summary_zh: string;
  body_zh: string;
  keywords?: string[];
  source_ids?: string[];
  release_channel: string;
  review_status: string;
  sensitivity: string;
  sort_order?: number;
  sections?: Array<Record<string, unknown>>;
}

export interface StaticSearchDocument {
  id: string;
  entity_type: string;
  entity_id: string;
  slug: string;
  title_zh: string;
  body_zh: string;
  keywords?: string[];
  release_channel?: string;
  source_ids?: string[];
  weight?: number;
  updated_at?: string;
}

const cache = new Map<string, unknown>();

function projectRoot() {
  return process.env.PINUYUMAYAN_PROJECT_ROOT || path.resolve(process.cwd(), "..");
}

async function readJson<T>(relativePath: string): Promise<T> {
  const absolute = path.join(projectRoot(), relativePath);
  const stateless = process.env.PINUYUMAYAN_DISABLE_STATIC_JSON_CACHE === "true";
  if (!stateless && cache.has(absolute)) return cache.get(absolute) as T;
  const parsed = JSON.parse(await readFile(absolute, "utf8")) as T;
  if (!stateless) cache.set(absolute, parsed);
  return parsed;
}

function textIncludes(value: unknown, q: string): boolean {
  return String(value ?? "").toLocaleLowerCase().includes(q.toLocaleLowerCase());
}

function toLimit(value: number | undefined, fallback: number, max: number) {
  const n = Number(value ?? fallback);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(max, Math.floor(n)));
}

export async function loadStaticBootstrap() {
  return readJson<any>("data/integration/main_site_static_bootstrap_bundle_v16.json");
}

export async function loadStaticCards(): Promise<StaticKnowledgeCard[]> {
  const payload = await readJson<{ items: StaticKnowledgeCard[] }>("data/content/public_knowledge_cards_v16.json");
  return payload.items;
}

export async function loadStaticCollections() {
  const payload = await readJson<{ items: any[] }>("data/content/public_content_collections_v16.json");
  return payload.items;
}

export async function loadStaticSearchDocuments(): Promise<StaticSearchDocument[]> {
  const payload = await readJson<{ documents: StaticSearchDocument[] }>("data/search/public_search_documents_v16.json");
  return payload.documents;
}

export async function loadStaticVocabularyEntries(): Promise<any[]> {
  const payload = await readJson<{ entries: any[] }>("data/web/puyuma_vocabulary_audio_entries.json");
  return payload.entries;
}

export async function staticSearchKnowledge(input: { q?: string; limit?: number; entityTypes?: string[] }) {
  const q = String(input.q ?? "").trim();
  const limit = toLimit(input.limit, 20, 100);
  let docs = await loadStaticSearchDocuments();
  const entityTypes = input.entityTypes?.filter(Boolean) ?? [];
  if (entityTypes.length) docs = docs.filter((item) => entityTypes.includes(item.entity_type));
  if (q) {
    docs = docs.filter((item) => textIncludes(item.title_zh, q) || textIncludes(item.body_zh, q) || (item.keywords ?? []).some((kw) => textIncludes(kw, q)));
  }
  docs = docs.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
  return { items: docs.slice(0, limit), limit, source: "static_json_v16" };
}

export async function staticVocabulary(input: { dialectCode?: string; q?: string; categoryKey?: string; limit?: number }) {
  const limit = toLimit(input.limit, 20, 500);
  let rows = await loadStaticVocabularyEntries();
  if (input.dialectCode) rows = rows.filter((row) => row.language?.dialect_code === input.dialectCode);
  if (input.categoryKey) rows = rows.filter((row) => row.category?.website_category_key === input.categoryKey);
  const q = String(input.q ?? "").trim();
  if (q) rows = rows.filter((row) => textIncludes(row.text?.puyuma_form, q) || textIncludes(row.text?.zh_tw, q) || textIncludes(row.text?.en, q));
  return { items: rows.slice(0, limit), limit, source: "static_json_v16" };
}

export async function staticCommunityProfile(communityKey: string) {
  const bootstrap = await loadStaticBootstrap();
  const community = (bootstrap.communities ?? []).find((item: any) => item.key === communityKey || item.community_key === communityKey) ?? null;
  const docs = await loadStaticSearchDocuments();
  const relatedFacts = docs.filter((doc) => doc.entity_type === "community" && doc.entity_id === communityKey || (doc.keywords ?? []).includes(communityKey)).slice(0, 30);
  return { community, relatedFacts, source: "static_json_v16" };
}

export async function staticRelatedKnowledge(input: { entityType: string; entityId: string; limit?: number }) {
  const limit = toLimit(input.limit, 12, 50);
  const docs = await loadStaticSearchDocuments();
  const items = docs.filter((doc) => doc.entity_type === input.entityType || doc.entity_id === input.entityId || doc.slug.includes(input.entityId)).slice(0, limit);
  return { edges: [], items, limit, source: "static_json_v16" };
}

export async function staticContentCollections(channel = "public") {
  const collections = (await loadStaticCollections()).filter((item: any) => item.release_channel === channel || channel === "all");
  return { ok: true, source: "static_json_v16", channel, collections };
}

export async function staticContentBySlug(slug: string) {
  const cards = await loadStaticCards();
  const item = cards.find((card) => card.slug === slug) ?? null;
  return { ok: Boolean(item), source: "static_json_v16", slug, item };
}

export async function staticLearningSets() {
  const payload = await readJson<{ items: any[] }>("data/content/vocabulary_learning_sets_v16.json");
  return payload.items;
}
