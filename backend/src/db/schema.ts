import { mysqlTable, varchar, text, datetime, json, boolean, int, decimal, mysqlEnum, primaryKey, index, uniqueIndex } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const kbSources = mysqlTable("kb_sources", {
  id: varchar("id", { length: 80 }).primaryKey(),
  sourceId: varchar("source_id", { length: 120 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  url: text("url"),
  publisher: varchar("publisher", { length: 255 }),
  sourceType: mysqlEnum("source_type", ["official", "academic", "community", "dataset", "internal_review", "unknown"]).notNull().default("unknown"),
  license: varchar("license", { length: 160 }),
  trustLevel: mysqlEnum("trust_level", ["primary", "high", "medium", "low", "unknown"]).notNull().default("unknown"),
  reviewStatus: mysqlEnum("review_status", ["verified", "needs_review", "rejected", "archived"]).notNull().default("needs_review"),
  metadataJson: json("metadata_json"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({ sourceIdUnique: uniqueIndex("uq_kb_sources_source_id").on(table.sourceId) }));

export const kbFacts = mysqlTable("kb_facts", {
  id: varchar("id", { length: 120 }).primaryKey(),
  category: varchar("category", { length: 120 }).notNull(),
  statementZh: text("statement_zh").notNull(),
  statementEn: text("statement_en"),
  sensitivity: mysqlEnum("sensitivity", ["low", "medium", "high"]).notNull().default("medium"),
  verificationStatus: mysqlEnum("verification_status", ["verified_public", "needs_review", "rejected", "archived"]).notNull().default("needs_review"),
  visibility: mysqlEnum("visibility", ["public", "public_summary_only", "admin_only", "restricted"]).notNull().default("public_summary_only"),
  sourceIdsJson: json("source_ids_json").notNull(),
  evidenceHint: text("evidence_hint"),
  tagsJson: json("tags_json"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const pinuyumayanCommunities = mysqlTable("pinuyumayan_communities", {
  id: varchar("id", { length: 80 }).primaryKey(),
  communityKey: varchar("community_key", { length: 80 }).notNull(),
  sortOrder: int("sort_order").notNull(),
  nameZh: varchar("name_zh", { length: 80 }).notNull(),
  romanization: varchar("romanization", { length: 120 }).notNull(),
  originSystem: varchar("origin_system", { length: 80 }),
  administrativeHint: varchar("administrative_hint", { length: 255 }),
  platformSummary: text("platform_summary"),
  contentFocusJson: json("content_focus_json"),
  sourceIdsJson: json("source_ids_json").notNull(),
  reviewStatus: mysqlEnum("review_status", ["approved", "needs_review", "archived"]).notNull().default("needs_review")
}, (table) => ({ keyUnique: uniqueIndex("uq_community_key").on(table.communityKey) }));

export const pinuyumayanRituals = mysqlTable("pinuyumayan_rituals", {
  id: varchar("id", { length: 100 }).primaryKey(),
  nameZh: varchar("name_zh", { length: 160 }).notNull(),
  category: varchar("category", { length: 120 }),
  timeHint: varchar("time_hint", { length: 255 }),
  summary: text("summary").notNull(),
  communitiesJson: json("communities_json"),
  platformTagsJson: json("platform_tags_json"),
  visibility: mysqlEnum("visibility", ["public", "public_summary_only", "admin_only", "restricted"]).notNull().default("public_summary_only"),
  sensitivity: mysqlEnum("sensitivity", ["low", "medium", "high"]).notNull().default("medium"),
  sourceIdsJson: json("source_ids_json").notNull(),
  reviewStatus: mysqlEnum("review_status", ["approved", "needs_review", "rejected", "archived"]).notNull().default("needs_review")
});

export const puyumaCorpusEntries = mysqlTable("puyuma_corpus_entries", {
  id: varchar("id", { length: 120 }).primaryKey(),
  corpusScope: mysqlEnum("corpus_scope", ["preview_subset", "full_corpus", "manual_curated"]).notNull().default("preview_subset"),
  entryType: mysqlEnum("entry_type", ["word", "phrase", "sentence", "paragraph"]).notNull().default("sentence"),
  dialectCode: varchar("dialect_code", { length: 10 }).notNull(),
  dialectName: varchar("dialect_name", { length: 120 }).notNull(),
  dialectZh: varchar("dialect_zh", { length: 80 }).notNull(),
  communityKey: varchar("community_key", { length: 80 }),
  categoryKey: varchar("category_key", { length: 80 }),
  puyumaForm: text("puyuma_form").notNull(),
  zhTw: text("zh_tw"),
  en: text("en"),
  sourcePhon: text("source_phon"),
  ipaValue: text("ipa_value"),
  ipaStatus: mysqlEnum("ipa_status", ["source_phon", "rule_based_draft", "linguist_verified", "missing"]).notNull().default("missing"),
  g2pJson: json("g2p_json"),
  ttsJson: json("tts_json"),
  sourceId: varchar("source_id", { length: 120 }).notNull(),
  sourcePath: text("source_path"),
  sourceRow: int("source_row"),
  sourceFormat: mysqlEnum("source_format", ["csv", "xml", "manual", "unknown"]).notNull().default("unknown"),
  reviewStatus: mysqlEnum("review_status", ["approved_for_public_learning", "needs_review", "rejected", "archived"]).notNull().default("needs_review"),
  sensitivity: mysqlEnum("sensitivity", ["public", "medium", "high"]).notNull().default("public")
}, (table) => ({ dialectIdx: index("idx_corpus_dialect").on(table.dialectCode), scopeIdx: index("idx_corpus_scope").on(table.corpusScope) }));

export const puyumaAudioAssets = mysqlTable("puyuma_audio_assets", {
  id: varchar("id", { length: 120 }).primaryKey(),
  corpusEntryId: varchar("corpus_entry_id", { length: 120 }).notNull(),
  remoteUrl: text("remote_url").notNull(),
  mimeType: varchar("mime_type", { length: 80 }).notNull().default("audio/mpeg"),
  provider: varchar("provider", { length: 160 }),
  storageMode: mysqlEnum("storage_mode", ["remote_url", "mirrored_local", "r2", "s3", "cdn"]).notNull().default("remote_url"),
  localMirrorPath: text("local_mirror_path"),
  durationSeconds: decimal("duration_seconds", { precision: 8, scale: 2 }),
  licenseReviewStatus: mysqlEnum("license_review_status", ["not_reviewed", "approved", "blocked", "not_required"]).notNull().default("not_reviewed"),
  playbackEnabled: boolean("playback_enabled").notNull().default(true)
});

export const kbReviewTasks = mysqlTable("kb_review_tasks", {
  id: varchar("id", { length: 120 }).primaryKey(),
  entityType: varchar("entity_type", { length: 80 }).notNull(),
  entityId: varchar("entity_id", { length: 120 }).notNull(),
  taskType: mysqlEnum("task_type", ["source_check", "sensitivity_check", "linguist_review", "community_review", "license_review", "publish_review"]).notNull(),
  priority: mysqlEnum("priority", ["p0", "p1", "p2", "p3"]).notNull().default("p2"),
  status: mysqlEnum("status", ["open", "in_progress", "approved", "rejected", "archived"]).notNull().default("open"),
  assignedRole: varchar("assigned_role", { length: 120 }),
  notes: text("notes"),
  dueAt: datetime("due_at")
});

export const kbImportRuns = mysqlTable("kb_import_runs", {
  id: varchar("id", { length: 120 }).primaryKey(),
  importKey: varchar("import_key", { length: 120 }).notNull(),
  importType: mysqlEnum("import_type", ["facts", "communities", "rituals", "vocabulary_preview", "formosanbank_full_corpus", "audio_mirror", "search_index"]).notNull(),
  status: mysqlEnum("status", ["planned", "running", "completed", "failed", "rolled_back"]).notNull().default("planned"),
  sourceCount: int("source_count").notNull().default(0),
  rowsInserted: int("rows_inserted").notNull().default(0),
  rowsUpdated: int("rows_updated").notNull().default(0),
  rowsRejected: int("rows_rejected").notNull().default(0),
  summaryJson: json("summary_json")
});

// v13 admin authentication and content delivery tables
export const adminUsers = mysqlTable("admin_users", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  status: mysqlEnum("status", ["active", "disabled", "locked", "pending_rotation"]).notNull().default("pending_rotation"),
  isSuperAdmin: boolean("is_super_admin").notNull().default(false),
  mustChangePassword: boolean("must_change_password").notNull().default(true),
  lastLoginAt: datetime("last_login_at"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({ emailUnique: uniqueIndex("uq_admin_users_email").on(table.email) }));

export const adminUserRoles = mysqlTable("admin_user_roles", {
  adminUserId: int("admin_user_id").notNull(),
  roleKey: varchar("role_key", { length: 80 }).notNull(),
  grantedBy: int("granted_by"),
  grantedAt: datetime("granted_at").notNull().default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({ pk: primaryKey({ columns: [table.adminUserId, table.roleKey] }) }));

export const adminSessions = mysqlTable("admin_sessions", {
  id: int("id").primaryKey().autoincrement(),
  adminUserId: int("admin_user_id").notNull(),
  sessionTokenHash: varchar("session_token_hash", { length: 64 }).notNull(),
  requestId: varchar("request_id", { length: 80 }),
  ipHash: varchar("ip_hash", { length: 64 }),
  userAgentHash: varchar("user_agent_hash", { length: 64 }),
  expiresAt: datetime("expires_at").notNull(),
  revokedAt: datetime("revoked_at"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({ tokenUnique: uniqueIndex("uq_admin_session_token_hash").on(table.sessionTokenHash) }));

export const mainSiteSuperadminLinks = mysqlTable("main_site_superadmin_links", {
  id: int("id").primaryKey().autoincrement(),
  adminUserId: int("admin_user_id").notNull(),
  mainSiteUserId: varchar("main_site_user_id", { length: 120 }),
  mainSiteEmail: varchar("main_site_email", { length: 255 }).notNull(),
  syncStatus: mysqlEnum("sync_status", ["pending", "synced", "failed", "disabled"]).notNull().default("pending"),
  lastSyncedAt: datetime("last_synced_at"),
  lastError: text("last_error"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({ mainSiteEmailUnique: uniqueIndex("uq_main_site_superadmin_email").on(table.mainSiteEmail) }));

export const contentItems = mysqlTable("content_items", {
  id: varchar("id", { length: 120 }).primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull(),
  type: varchar("type", { length: 80 }).notNull(),
  titleZh: varchar("title_zh", { length: 255 }).notNull(),
  summaryZh: text("summary_zh"),
  status: mysqlEnum("status", ["draft_verified_source", "draft_sensitive_review", "verified_public", "verified_sensitive_summary", "approved", "archived"]).notNull().default("draft_verified_source"),
  visibility: mysqlEnum("visibility", ["public", "public_summary", "public_summary_only", "internal_review"]).notNull().default("public_summary"),
  releaseChannel: varchar("release_channel", { length: 80 }).notNull().default("preview"),
  sensitivity: varchar("sensitivity", { length: 40 }).notNull().default("low"),
  requiresHumanReview: boolean("requires_human_review").notNull().default(true),
  sourceIdsJson: json("source_ids_json").notNull(),
  relatedEntityJson: json("related_entity_json"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({ slugUnique: uniqueIndex("uq_content_items_slug").on(table.slug), typeStatusIdx: index("idx_content_items_type_status").on(table.type, table.status) }));
