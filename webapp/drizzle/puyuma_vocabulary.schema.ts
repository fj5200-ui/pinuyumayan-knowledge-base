import { boolean, index, json, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const puyumaVocabularyAudio = pgTable('puyuma_vocabulary_audio', {
  id: text('id').primaryKey(),
  dialectCode: text('dialect_code').notNull(),
  dialectName: text('dialect_name').notNull(),
  dialectZh: text('dialect_zh').notNull(),
  categoryKey: text('category_key').notNull(),
  categoryLabelZh: text('category_label_zh').notNull(),
  puyumaForm: text('puyuma_form').notNull(),
  zhTw: text('zh_tw').notNull(),
  en: text('en'),
  audioUrl: text('audio_url').notNull(),
  ipa: text('ipa'),
  g2pJson: json('g2p_json'),
  ttsJson: json('tts_json'),
  publicTtsEnabled: boolean('public_tts_enabled').default(false).notNull(),
  sourceId: text('source_id').notNull(),
  sourcePath: text('source_path').notNull(),
  reviewStatus: text('review_status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  dialectIdx: index('puyuma_vocab_dialect_idx').on(table.dialectCode),
  categoryIdx: index('puyuma_vocab_category_idx').on(table.categoryKey),
}));
