import { mysqlTable, varchar, text, mediumtext, json, datetime, boolean, decimal, int, mysqlEnum, index, uniqueIndex } from 'drizzle-orm/mysql-core';

export const kbSources = mysqlTable('kb_sources', {
  id: varchar('id', { length: 80 }).primaryKey(),
  sourceId: varchar('source_id', { length: 80 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  url: text('url'),
  publisher: varchar('publisher', { length: 255 }),
  sourceType: mysqlEnum('source_type', ['official','academic','community','dataset','internal_review','unknown']).notNull(),
  license: varchar('license', { length: 120 }),
  trustLevel: mysqlEnum('trust_level', ['primary','high','medium','low','unknown']).notNull(),
  reviewStatus: mysqlEnum('review_status', ['verified','needs_review','rejected','archived']).notNull(),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
}, (t) => ({
  sourceIdUnique: uniqueIndex('uk_kb_sources_source_id').on(t.sourceId),
  typeIdx: index('idx_kb_sources_type').on(t.sourceType),
  reviewIdx: index('idx_kb_sources_review').on(t.reviewStatus),
}));

export const kbFacts = mysqlTable('kb_facts', {
  id: varchar('id', { length: 80 }).primaryKey(),
  factId: varchar('fact_id', { length: 80 }).notNull(),
  category: varchar('category', { length: 80 }).notNull(),
  statementZh: text('statement_zh').notNull(),
  statementEn: text('statement_en'),
  sourceIds: json('source_ids').notNull(),
  evidenceHint: text('evidence_hint'),
  sensitivity: mysqlEnum('sensitivity', ['public','medium','high','restricted']).notNull(),
  verificationStatus: mysqlEnum('verification_status', ['verified','needs_review','conflicting','rejected']).notNull(),
  publicUseAllowed: boolean('public_use_allowed').notNull(),
  contentPolicy: json('content_policy'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
}, (t) => ({
  factIdUnique: uniqueIndex('uk_kb_facts_fact_id').on(t.factId),
  categoryIdx: index('idx_kb_facts_category').on(t.category),
  sensitivityIdx: index('idx_kb_facts_sensitivity').on(t.sensitivity),
}));

export const puyumaAudioAssets = mysqlTable('puyuma_audio_assets', {
  id: varchar('id', { length: 80 }).primaryKey(),
  audioAssetId: varchar('audio_asset_id', { length: 120 }).notNull(),
  sourceAudioUrl: text('source_audio_url').notNull(),
  mirrorUrl: text('mirror_url'),
  localPath: text('local_path'),
  durationSec: decimal('duration_sec', { precision: 8, scale: 2 }),
  mimeType: varchar('mime_type', { length: 80 }),
  license: varchar('license', { length: 120 }),
  mirrorStatus: mysqlEnum('mirror_status', ['not_mirrored','queued','mirrored','failed','license_blocked']).notNull(),
  lastCheckedAt: datetime('last_checked_at'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
}, (t) => ({
  audioAssetUnique: uniqueIndex('uk_puyuma_audio_asset_id').on(t.audioAssetId),
  mirrorIdx: index('idx_puyuma_audio_mirror').on(t.mirrorStatus),
}));

export const puyumaCorpusEntries = mysqlTable('puyuma_corpus_entries', {
  id: varchar('id', { length: 80 }).primaryKey(),
  entryId: varchar('entry_id', { length: 120 }).notNull(),
  datasetScope: mysqlEnum('dataset_scope', ['preview_subset','full_corpus','manual_curated']).notNull(),
  dialectCode: varchar('dialect_code', { length: 10 }).notNull(),
  dialectName: varchar('dialect_name', { length: 80 }).notNull(),
  communityKey: varchar('community_key', { length: 80 }),
  entryType: mysqlEnum('entry_type', ['sentence','word','phrase','dialogue','story_line']).notNull(),
  category: varchar('category', { length: 80 }),
  puyumaText: text('puyuma_text').notNull(),
  zhTw: text('zh_tw'),
  en: text('en'),
  sourcePhon: text('source_phon'),
  g2pOutput: json('g2p_output'),
  ipaValue: text('ipa_value'),
  ipaStatus: mysqlEnum('ipa_status', ['source_phon','rule_based_draft','manual_verified','missing']).notNull(),
  audioAssetId: varchar('audio_asset_id', { length: 120 }),
  sourceId: varchar('source_id', { length: 80 }).notNull(),
  sourcePath: text('source_path'),
  sourceRowOrSentenceId: varchar('source_row_or_sentence_id', { length: 80 }),
  sourceFormat: mysqlEnum('source_format', ['csv','xml','json','manual']).notNull(),
  copyright: varchar('copyright', { length: 120 }),
  reviewStatus: mysqlEnum('review_status', ['verified','needs_review','blocked']).notNull(),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
}, (t) => ({
  entryUnique: uniqueIndex('uk_puyuma_entry_id').on(t.entryId),
  dialectIdx: index('idx_puyuma_dialect').on(t.dialectCode),
  scopeIdx: index('idx_puyuma_scope').on(t.datasetScope),
  ipaStatusIdx: index('idx_puyuma_ipa_status').on(t.ipaStatus),
}));

export const kbImportRuns = mysqlTable('kb_import_runs', {
  id: varchar('id', { length: 80 }).primaryKey(),
  runId: varchar('run_id', { length: 120 }).notNull(),
  pipelineName: varchar('pipeline_name', { length: 120 }).notNull(),
  inputManifest: text('input_manifest'),
  outputPath: text('output_path'),
  expectedMinEntries: int('expected_min_entries'),
  actualEntries: int('actual_entries').notNull(),
  audioEntries: int('audio_entries').notNull(),
  sourcePhonEntries: int('source_phon_entries').notNull(),
  status: mysqlEnum('status', ['planned','running','passed','failed','partial']).notNull(),
  reportJson: json('report_json'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
}, (t) => ({
  runUnique: uniqueIndex('uk_kb_import_run_id').on(t.runId),
  pipelineIdx: index('idx_import_pipeline').on(t.pipelineName),
  statusIdx: index('idx_import_status').on(t.status),
}));
