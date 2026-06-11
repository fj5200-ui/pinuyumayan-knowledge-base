import { readFile } from "node:fs/promises";
import path from "node:path";

export interface PronunciationRequest {
  entryId?: string;
  text?: string;
  dialectCode?: string;
}

function projectRoot() {
  return process.env.PINUYUMAYAN_PROJECT_ROOT || path.resolve(process.cwd(), "..");
}

let catalogCache: any[] | null = null;
let modelCache: any[] | null = null;

async function readJson<T>(relativePath: string): Promise<T> {
  const absolute = path.join(projectRoot(), relativePath);
  return JSON.parse(await readFile(absolute, "utf8")) as T;
}

export async function loadPronunciationCatalog() {
  if (catalogCache && process.env.PINUYUMAYAN_DISABLE_STATIC_JSON_CACHE !== "true") return catalogCache;
  const payload = await readJson<{ entries: any[] }>("data/audio/puyuma_pronunciation_catalog_v16.json");
  catalogCache = payload.entries ?? [];
  return catalogCache;
}

export async function loadVoiceModelRegistry() {
  if (modelCache && process.env.PINUYUMAYAN_DISABLE_STATIC_JSON_CACHE !== "true") return modelCache;
  const payload = await readJson<{ models: any[] }>("data/audio/puyuma_tts_voice_model_registry_v16.json");
  modelCache = payload.models ?? [];
  return modelCache;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function getPronunciationForEntry(entryId: string) {
  const rows = await loadPronunciationCatalog();
  const item = rows.find((row) => row.entry_id === entryId || row.id === entryId) ?? null;
  return {
    ok: Boolean(item),
    mode: item ? "verified_source_audio" : "not_found",
    item,
    policy: "Public pronunciation uses verified human source audio first. Synthetic TTS is not public unless trained, licensed and reviewed."
  };
}

export async function findPronunciation(input: PronunciationRequest) {
  const rows = await loadPronunciationCatalog();
  let candidates = rows;
  if (input.dialectCode) candidates = candidates.filter((row) => row.language?.dialect_code === input.dialectCode);
  if (input.entryId) {
    const exact = candidates.find((row) => row.entry_id === input.entryId || row.id === input.entryId);
    if (exact) return { ok: true, matchType: "entry_id", item: exact };
  }
  const q = normalizeText(String(input.text ?? ""));
  if (q) {
    const exactText = candidates.find((row) => row.text?.normalized_for_match === q);
    if (exactText) return { ok: true, matchType: "exact_text", item: exactText };
    const fuzzy = candidates.find((row) => String(row.text?.normalized_for_match ?? "").includes(q) || q.includes(String(row.text?.normalized_for_match ?? "")));
    if (fuzzy) return { ok: true, matchType: "partial_text", item: fuzzy };
  }
  return { ok: false, matchType: "none", item: null };
}

export async function requestTtsLikeSourceAudio(input: PronunciationRequest & { allowSynthetic?: boolean }) {
  const match = await findPronunciation(input);
  if (match.ok) {
    return {
      status: "source_audio_returned",
      ttsMode: "human_recorded_source_audio_primary",
      isSynthetic: false,
      publicPlayable: true,
      pronunciation: match.item,
      messageZh: "已找到對應真人來源音檔，直接播放來源音檔，發音品質優先於合成 TTS。"
    };
  }
  const models = await loadVoiceModelRegistry();
  const neural = models.find((m) => m.id === "puyuma_neural_tts_candidate_v1");
  return {
    status: input.allowSynthetic ? "queued_for_admin_review_only" : "rejected_no_verified_audio",
    ttsMode: "neural_tts_not_public_without_training_review",
    isSynthetic: true,
    publicPlayable: false,
    selectedModel: neural,
    messageZh: "目前沒有對應真人音檔。若要像音檔一樣自然，需先以授權語料訓練/微調卑南語 TTS 並經審核；公開端不會用未審核假 TTS。"
  };
}
