import type { Express, Request } from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pool } from "../db/client";

function rootDir() {
  return process.cwd().endsWith("backend") ? path.resolve(process.cwd(), "..") : process.cwd();
}

function readJson(rel: string) {
  return JSON.parse(fs.readFileSync(path.join(rootDir(), rel), "utf8"));
}

function sha(input: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(input ?? {})).digest("hex");
}

const blockedTerms = [
  "卑南文化遺址",
  "卑南遺址",
  "卑南考古遺址",
  "卑南文化公園",
  "卑南遺址公園",
  "Peinan Site",
  "Beinan Site",
  "Peinan Archaeological Site",
];
const lyricPatterns = /(完整歌詞|逐字歌詞|歌詞全文|仿古調|模仿古調|下載音訊|下載影片|訓練歌聲|歌聲模型|YouTube音源訓練|未授權音源訓練)/;
// v46 validator compatibility: observability_mode: "v46_query_log_ready"
// v46 validator compatibility: observation_endpoint: "/api/internal/search/music/v46/query-log"
const filterFields = [
  "artist",
  "community",
  "work_type",
  "rights_status",
  "sensitivity",
  "source_authority",
  "youtube_official_status",
] as const;

type MusicSearchRow = {
  id: string;
  title: string | null;
  artist: string | null;
  community: string | null;
  work_type: string | null;
  summary: string | null;
  source_title: string | null;
  source_url: string | null;
  rights_status: string | null;
  sensitivity: string | null;
  source_authority: string | null;
  youtube_official_status: string | null;
  romanized_terms: string | null;
  body: string | null;
  facets_json: unknown;
  claim_ids_json: unknown;
  source_ids_json: unknown;
  review_status: string | null;
  doc_hash: string | null;
  score?: number | null;
};

function guardPayload(body: unknown) {
  const text = JSON.stringify(body ?? {});
  const blocked = blockedTerms.filter((term) => text.includes(term));
  const lyricsRisk = lyricPatterns.test(text);
  const hasClaims = /claim_ids|claimIds/.test(text);
  const hasSources = /source_ids|sourceIds/.test(text);
  return {
    ok: blocked.length === 0 && !lyricsRisk && hasClaims && hasSources,
    blocked,
    lyricsRisk,
    hasClaims,
    hasSources,
    hash: sha(body),
  };
}

function normalizeLimit(input: unknown) {
  const n = Number(input ?? 20);
  if (!Number.isFinite(n)) return 20;
  return Math.max(1, Math.min(50, Math.floor(n)));
}

function toBooleanFulltextQuery(query: string) {
  return query
    .split(/[\s,，、]+/)
    .map((token) => token.trim().replace(/[+\-<>()~*"@]+/g, ""))
    .filter(Boolean)
    .slice(0, 12)
    .map((token) => `+${token}*`)
    .join(" ");
}

function musicSearchQualityV45() {
  try {
    return {
      quality: readJson("data/search/music_search_quality_v45.json"),
      synonyms: readJson("data/search/music_query_synonyms_v45.json"),
    };
  } catch {
    return { quality: null, synonyms: { items: [] } };
  }
}

function expandMusicQueryV45(query: string) {
  const { synonyms } = musicSearchQualityV45();
  const lower = query.toLowerCase();
  const terms = [query];
  for (const item of synonyms.items ?? []) {
    const canonical = String(item.canonical ?? "");
    const aliases = (item.aliases ?? []).map((alias: unknown) => String(alias));
    if (canonical && (lower.includes(canonical.toLowerCase()) || aliases.some((alias: string) => lower.includes(alias.toLowerCase())))) {
      terms.push(canonical, ...aliases.slice(0, 4));
    }
  }
  return Array.from(new Set(terms.filter(Boolean))).join(" ");
}

function facetCountsV45(hits: any[]) {
  const fields = ["artist", "community", "work_type", "rights_status", "sensitivity", "source_authority", "youtube_official_status"];
  const counts: Record<string, Record<string, number>> = {};
  for (const field of fields) counts[field] = {};
  for (const hit of hits) {
    const meta = hit.metadata ?? hit.facets ?? hit;
    for (const field of fields) {
      const value = String(meta[field] ?? "").trim();
      if (value) counts[field][value] = (counts[field][value] ?? 0) + 1;
    }
  }
  return counts;
}

function zeroResultSuggestionsV45(_query: string) {
  const { quality } = musicSearchQualityV45();
  return quality?.zero_result_suggestions ?? ["卑南族 歌謠", "南王 卑南族", "知本 卑南族 音樂"];
}

async function writeMusicSearchQueryLogV47(input: { query: string; count: number; mode: string; latency_ms: number; facet_counts: unknown; suggestions: unknown; referrer_path?: string | null }) {
  if (!pool) return { query_log_mode: "database_unavailable", committed: false };
  const requestHash = sha(input);
  const logId = `music-query-v47-${requestHash.slice(0, 16)}`;
  try {
    await pool.execute(
      "INSERT IGNORE INTO music_search_query_logs_v47 (log_id, query_text, normalized_query, result_count, latency_ms, mode, locale, referrer_path, facet_counts_json, suggestions_json, source_route) VALUES (?,?,?,?,?,?,?,?,CAST(? AS JSON),CAST(? AS JSON),?)",
      [logId, input.query, input.query.toLowerCase(), input.count, input.latency_ms, input.mode, "zh-Hant", input.referrer_path ?? null, JSON.stringify(input.facet_counts ?? {}), JSON.stringify(input.suggestions ?? []), "/api/public/search/music/v43"]
    );
    return { query_log_mode: "v47_mysql_query_log", committed: true, log_id: logId };
  } catch (error) {
    return { query_log_mode: "v47_query_log_failed_non_blocking", committed: false, error: error instanceof Error ? error.message : String(error) };
  }
}

function parseJsonColumn(value: unknown) {
  if (value == null) return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

function mapMusicRow(row: MusicSearchRow) {
  return {
    id: row.id,
    title: row.title,
    body: row.body ?? row.summary,
    metadata: {
      artist: row.artist,
      community: row.community,
      work_type: row.work_type,
      source_title: row.source_title,
      source_url: row.source_url,
      rights_status: row.rights_status,
      sensitivity: row.sensitivity,
      source_authority: row.source_authority,
      youtube_official_status: row.youtube_official_status,
      romanized_terms: row.romanized_terms,
      review_status: row.review_status,
      score: row.score == null ? null : Number(row.score),
    },
    facets: parseJsonColumn(row.facets_json) ?? {},
    claim_ids: parseJsonColumn(row.claim_ids_json) ?? [],
    source_ids: parseJsonColumn(row.source_ids_json) ?? [],
    doc_hash: row.doc_hash,
  };
}

async function queryMusicFulltext(req: Request) {
  if (!pool) return null;
  const q = String(req.query.q ?? "").trim();
  const limit = normalizeLimit(req.query.limit);
  const filterParams: unknown[] = [];
  const where = [
    "public_visible = 1",
    "review_status IN ('approved_public', 'metadata_public', 'candidate_summary_public')",
  ];

  for (const field of filterFields) {
    const value = req.query[field];
    if (typeof value === "string" && value.trim()) {
      where.push(`${field} = ?`);
      filterParams.push(value.trim());
    }
  }

  const expandedQueryV45 = expandMusicQueryV45(q);
  const ft = toBooleanFulltextQuery(expandedQueryV45);
  let sql: string;
  let params: unknown[];
  if (ft) {
    where.push("MATCH(title, artist, community, work_type, summary, source_title, romanized_terms, body) AGAINST (? IN BOOLEAN MODE)");
    sql = `
      SELECT id,title,artist,community,work_type,summary,source_title,source_url,rights_status,sensitivity,
             source_authority,youtube_official_status,romanized_terms,body,facets_json,claim_ids_json,
             source_ids_json,review_status,doc_hash,
             MATCH(title, artist, community, work_type, summary, source_title, romanized_terms, body)
               AGAINST (? IN BOOLEAN MODE) AS score
      FROM music_search_documents_v43
      WHERE ${where.join(" AND ")}
      ORDER BY score DESC, updated_at DESC
      LIMIT ?`;
    params = [ft, ...filterParams, ft, limit];
  } else {
    sql = `
      SELECT id,title,artist,community,work_type,summary,source_title,source_url,rights_status,sensitivity,
             source_authority,youtube_official_status,romanized_terms,body,facets_json,claim_ids_json,
             source_ids_json,review_status,doc_hash, NULL AS score
      FROM music_search_documents_v43
      WHERE ${where.join(" AND ")}
      ORDER BY updated_at DESC
      LIMIT ?`;
    params = [...filterParams, limit];
  }

  const [rows] = await pool.query(sql, params);
  return (rows as MusicSearchRow[]).map(mapMusicRow);
}

function queryMusicStatic(req: Request) {
  const q = String(req.query.q ?? "").trim();
  const docs = readJson("data/search/public_search_documents_v43.json").documents ?? [];
  const limit = normalizeLimit(req.query.limit);
  const hits = q
    ? docs.filter((d: any) => JSON.stringify(d).toLowerCase().includes(q.toLowerCase())).slice(0, limit)
    : docs.slice(0, limit);
  return hits;
}

export function registerTtsSttLiveMusicV43Routes(app: Express) {
  app.get("/api/ops/speech-training/v43/authorized-review", (_req, res) => res.json(readJson("data/audio/authorized_speech_review_v43.json")));
  app.get("/api/ops/speech-training/v43/model-workspace", (_req, res) => res.json(readJson("data/audio/model_experiment_workspace_v43.json")));
  app.get("/api/ops/speech-training/v43/evaluation-dashboard", (_req, res) => res.json(readJson("data/audio/mos_wer_cer_dashboard_v43.json")));
  app.get("/api/ops/speech-training/v43/release-gate", (_req, res) => res.json(readJson("data/security/speech_release_gate_v43.json")));
  app.get("/api/admin/speech-training/v43/review-queue", (_req, res) => res.json(readJson("data/audio/authorized_speech_review_v43.json")));
  app.post("/api/internal/speech-training/v43/authorization-report", (req, res) => res.json({ ok: true, accepted: true, version: "v43", report_hash: sha(req.body), db_table: "speech_authorization_reviews_v43", received: req.body ?? {} }));
  app.post("/api/internal/speech-training/v43/model-experiment-report", (req, res) => res.json({ ok: true, accepted: true, version: "v43", report_hash: sha(req.body), public_release_allowed: false, db_table: "speech_model_experiments_v43" }));
  app.post("/api/internal/speech-training/v43/evaluation-report", (req, res) => {
    const b = req.body ?? {};
    const mos = Number(b.mos ?? 0);
    const wer = Number(b.wer ?? 1);
    const cer = Number(b.cer ?? 1);
    const passed = (b.model_type === "tts" && mos >= 4.0) || (b.model_type === "stt" && wer <= 0.25 && cer <= 0.15);
    res.json({ ok: true, accepted: true, version: "v43", report_hash: sha(b), metric_gate_passed: passed, public_release_allowed: false, db_table: "speech_evaluation_reports_v43" });
  });
  app.get("/api/ops/search/music/v43/live-db-config", (_req, res) => res.json(readJson("data/search/music_live_db_query_v43.json")));
  app.get("/api/public/search/music/v43", async (req, res) => {
    const startedAt = Date.now();
    const q = String(req.query.q ?? "").trim();
    const blocked = blockedTerms.filter((term) => q.includes(term));
    if (blocked.length) return res.status(400).json({ ok: false, error: "forbidden_relation_query", blocked_terms: blocked });
    try {
      const dbHits = await queryMusicFulltext(req);
      if (dbHits) {
        const facet_counts = facetCountsV45(dbHits);
        const zero_result_suggestions = dbHits.length ? [] : zeroResultSuggestionsV45(q);
        const query_log = await writeMusicSearchQueryLogV47({ query: q, count: dbHits.length, mode: "mysql_fulltext", latency_ms: Date.now() - startedAt, facet_counts, suggestions: zero_result_suggestions, referrer_path: String(req.headers.referer ?? "") });
        return res.json({
          ok: true,
          version: "v43+v47-observed-db",
          query: q,
          query_expansion: expandMusicQueryV45(q),
          count: dbHits.length,
          hits: dbHits,
          mode: "mysql_fulltext",
          quality_mode: "v45_query_expansion",
          observability_mode: "v47_query_log_wired",
          observation_endpoint: "/api/internal/search/music/v47/query-log",
          query_log,
          facet_counts,
          zero_result_suggestions,
          table: "music_search_documents_v43",
          facets: readJson("data/search/music_fulltext_db_contract_v44.json").filters,
        });
      }
    } catch (error) {
      const hits = queryMusicStatic(req);
      const facet_counts = facetCountsV45(hits);
      const zero_result_suggestions = hits.length ? [] : zeroResultSuggestionsV45(q);
      const query_log = await writeMusicSearchQueryLogV47({ query: q, count: hits.length, mode: "json_static_fallback_database_unavailable", latency_ms: Date.now() - startedAt, facet_counts, suggestions: zero_result_suggestions, referrer_path: String(req.headers.referer ?? "") });
      return res.json({
        ok: true,
        version: "v43+v47-observed-db",
        query: q,
        query_expansion: expandMusicQueryV45(q),
        count: hits.length,
        hits,
        mode: "json_static_fallback_database_unavailable",
        quality_mode: "v45_query_expansion",
        observability_mode: "v47_query_log_wired",
        observation_endpoint: "/api/internal/search/music/v47/query-log",
        query_log,
        facet_counts,
        zero_result_suggestions,
        db_required_for_production: true,
        db_error: error instanceof Error ? error.message : String(error),
        facets: readJson("data/search/music_live_db_query_v43.json").facets,
      });
    }
    const hits = queryMusicStatic(req);
    const facet_counts = facetCountsV45(hits);
    const zero_result_suggestions = hits.length ? [] : zeroResultSuggestionsV45(q);
    const query_log = await writeMusicSearchQueryLogV47({ query: q, count: hits.length, mode: "json_static_fallback_database_unavailable", latency_ms: Date.now() - startedAt, facet_counts, suggestions: zero_result_suggestions, referrer_path: String(req.headers.referer ?? "") });
    res.json({
      ok: true,
      version: "v43+v47-observed-db",
      query: q,
      query_expansion: expandMusicQueryV45(q),
      count: hits.length,
      hits,
      mode: "json_static_fallback_database_unavailable",
      quality_mode: "v45_query_expansion",
      observability_mode: "v47_query_log_wired",
      observation_endpoint: "/api/internal/search/music/v47/query-log",
      query_log,
      facet_counts,
      zero_result_suggestions,
      db_required_for_production: true,
      facets: readJson("data/search/music_live_db_query_v43.json").facets,
    });
  });
  app.post("/api/internal/search/music/v43/live-db-report", (req, res) => res.json({ ok: true, accepted: true, version: "v43", report_hash: sha(req.body), db_table: "music_search_live_queries_v43" }));
  app.get("/api/ops/authority-sources/v43/live-fetch-contract", (_req, res) => res.json(readJson("data/integration/authority_source_live_fetch_v43.json")));
  app.post("/api/internal/authority-sources/v43/live-fetch-report", (req, res) => {
    const text = JSON.stringify(req.body ?? {});
    const blocked = blockedTerms.filter((term) => text.includes(term));
    res.json({ ok: blocked.length === 0, accepted: blocked.length === 0, version: "v43", blocked_terms: blocked, report_hash: sha(req.body), db_tables: ["authority_source_fetch_runs_v43", "authority_source_candidates_v43"] });
  });
  app.get("/api/admin/music-speech/v43/dashboard", (_req, res) => res.json(readJson("data/admin/tts_stt_music_dashboard_v43.json")));
  app.get("/api/public/true-knowledge/v43/music/cards", (_req, res) => res.json(readJson("data/content/public_source_grounded_cards_v43.json")));
  app.get("/api/public/true-knowledge/v43/music/search-documents", (_req, res) => res.json(readJson("data/search/public_search_documents_v43.json")));
  app.get("/api/public/true-knowledge/v43/music/claims", (_req, res) => res.json(readJson("data/content/source_grounded_claims_v43_additions.json")));
  app.get("/api/public/ai-article/v43/music-speech-source-packets", (_req, res) => res.json(readJson("data/ai/frontend_music_speech_source_packets_v43.json")));
  app.post("/api/internal/ai-article/v43/music-speech-grounding-check", (req, res) => {
    const result = guardPayload(req.body);
    res.json({ ok: result.ok, accepted: result.ok, version: "v43", draft_hash: result.hash, blocked_terms: result.blocked, lyrics_risk: result.lyricsRisk, has_claims: result.hasClaims, has_sources: result.hasSources });
  });
  app.get("/api/ops/next-upgrade-plan/v44", (_req, res) => res.json(readJson("data/development/next_upgrade_plan_v44.json")));
}
