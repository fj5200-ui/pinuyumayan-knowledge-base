# 卑南族文化綜合平台後端資料庫專案

本資料包已從 `pinuyumayan-expert` 技能包轉型為 **後端資料庫開發專案**。主用途是提供「卑南族文化綜合平台」的資料庫 schema、後端 API、語料匯入、音檔資產、審核流程、搜尋索引與後台營運規格。

## 專案定位

- 專案名稱：卑南族文化綜合平台後端資料庫
- 工程代號：`pinuyumayan-backend-database`
- 目標技術棧：Express + tRPC + Drizzle ORM + MySQL/TiDB
- 主入口：`PROJECT.md`
- legacy 規則：`legacy/SKILL.legacy.md` 僅保留歷史命名與文化安全規範，不再作為技能包入口。

## 目前內建資料量

| 資料類型 | 數量 | 說明 |
|---|---:|---|
| 可追溯 facts | 109 | 來源、敏感度、審核狀態皆保留 |
| 十社資料 | 10 | 以十社主用版與 alias 管理 |
| 祭儀公開摘要 | 7 | 僅公開摘要，不含禁忌/流程教學 |
| 語音語料 preview | 80 | 每筆含音檔 URL、G2P/IPA/TTS metadata |
| FormosanBank/ePark 全量候選來源 | 66 | 需執行全量匯入後產生千筆級語料 |

## 新後端專案目錄

```txt
backend/                    Express + tRPC 後端骨架
database/                   MySQL/TiDB DDL、migration、seed、ERD
data/                       真實來源資料、語料、治理設定
scripts/                    匯入、驗收、語料、音檔鏡像腳本
docs/                       架構、API、部署、資料治理文件
legacy/                     原技能包內容封存
```

## 開發順序

1. 先讀 `docs/backend_database_architecture.md`。
2. 建立 MySQL/TiDB：執行 `database/migrations/0001_core_schema.sql`。
3. 建立索引與 view：執行 `database/migrations/0002_indexes_views.sql`。
4. 匯入 seed：執行 `database/seeds/*.sql`。
5. 啟動後端：參考 `backend/README.md`。
6. 跑驗收：`python3 scripts/validate_backend_database_project.py`。

## 文化資料安全規則

- Puyuma 在工程與資料庫中只可指「南王」或英文語境中的 Puyuma language，不可代稱整個卑南族。
- 正式分類使用「卑南族十社」。
- 祭儀、祖靈、巫師、家族、禁忌內容須標 `sensitivity = medium/high`，公開前須 review。
- FormosanBank/ePark 音檔可建立 URL 索引；鏡像到 R2/S3/CDN 前必須確認授權。
- 80 筆語音資料是 preview subset；完整語料必須由 full corpus pipeline 建置。


## v6 主站拉取知識 API

這版新增主站可用的知識拉取層。主站不需要直接讀 JSON 或直連資料庫，應透過以下 API 取得已審核資料：

- `GET /api/public/knowledge/bootstrap`：首頁/全站初始知識。
- `GET /api/public/knowledge/search?q=...`：公開知識搜尋。
- `GET /api/public/knowledge/related?entityType=...&entityId=...`：文章、十社、祭儀、語詞頁的相關知識。
- `GET /api/public/knowledge/communities/:communityKey`：十社公開資料。
- `GET /api/public/knowledge/vocabulary`：卑南語語詞、IPA/source PHON、音檔 URL。
- `GET /api/internal/main-site/knowledge/bundle`：主站後端批次同步，需 `x-pinuyumayan-main-site-key`。
- `GET /api/internal/main-site/knowledge/delta`：主站後端增量同步，需 `x-pinuyumayan-main-site-key`。

相關文件：

- `docs/main_site_integration_guide.md`
- `docs/public_knowledge_api.md`
- `docs/main_site_pull_checklist.md`
- `data/integration/main_site_knowledge_api_contract.json`

## v7 部署時安裝與千筆語料匯入

這版新增正式部署安裝層。部署時建議採兩段式：

1. `preview`：先安裝後端、套用 migrations、匯入核心 seed 與 80 筆 preview 語音語料。
2. `postdeploy-full-corpus`：API 可用後，再背景匯入 FormosanBank/ePark 千筆級語料。

快速部署：

```bash
DEPLOY_INSTALL_MODE=preview APPLY_DATABASE_BOOTSTRAP=true ./deploy/install.sh
```

正式匯入千筆語料：

```bash
FULL_CORPUS_MIN_ENTRIES=1000 IMPORT_SQL_AFTER_BUILD=true ./deploy/postdeploy-full-corpus.sh
```

相關文件：

- `docs/deployment_installation_guide.md`
- `docs/vps_deployment_runbook.md`
- `data/deployment/deployment_install_plan.json`


## v8 生產營運強化層

這版新增正式營運需要的部署防呆與主站同步驗收：

- `deploy/preflight.sh`：部署前檢查環境變數、必要工具與核心檔案。
- `deploy/run-migrations.sh`：集中管理 migration 執行順序。
- `database/migrations/0004_production_ops.sql`：部署鎖、migration ledger、job runs、API key rotation、rate limit、webhook、主站同步 snapshot。
- `data/integration/main_site_contract_tests_v8.json`：主站拉取 API 契約測試。
- `docs/production_operations_runbook.md`：正式部署、回滾、千筆語料匯入營運規範。
- `docs/security_api_key_rotation.md`：主站 API key 輪替與安全規則。
- `docs/full_corpus_import_operations.md`：千筆語料匯入操作規範。

建議部署順序：

```bash
./deploy/preflight.sh
./deploy/run-migrations.sh --dry-run
DEPLOY_INSTALL_MODE=preview APPLY_DATABASE_BOOTSTRAP=true ./deploy/install.sh
./deploy/healthcheck.sh
python3 scripts/verify_main_site_contract.py --skip-network
FULL_CORPUS_MIN_ENTRIES=1000 IMPORT_SQL_AFTER_BUILD=true ./deploy/postdeploy-full-corpus.sh
```


## v9 Delivery Runtime Layer

本版新增主站拉取知識的工程交付層：OpenAPI、public/internal API 契約、快取與 revalidation、rate limit、webhook outbox、search reindex queue、corpus import checkpoints、CI/CD 與主站 smoke check。

核心新增：

```txt
openapi/pinuyumayan-main-site-api.openapi.json
database/migrations/0005_delivery_runtime.sql
backend/src/rest/openapiRoutes.ts
backend/src/security/rateLimit.ts
data/integration/main_site_delivery_runtime_v9.json
docs/main_site_delivery_runtime_v9.md
.github/workflows/ci.yml
```

千筆語料仍不在 API 啟動時匯入；正式流程是部署 API → 匯入 preview → 主站驗收 → 背景 full corpus import → reindex → 主站 delta sync。

## v10 Application Runtime Hardening

v10 adds implementation-ready runtime contracts: `/ready`, `/api/ops/readiness`, internal full-corpus job enqueue, unified API error shape, request IDs, runtime job tables, and main-site SDK v10 examples. The 80-entry preview subset remains separate from the post-deploy thousand-entry full corpus import.

## v11 Data Delivery Governance

v11 adds API versioning, scoped internal API access, export bundle artifacts, main-site sync replay, data quality report templates, retry/dead-letter policy, and public release channels. This layer keeps `preview_subset = 80` separate from the post-deploy `full_corpus >= 1000` import and gives the main site safer ways to pull, cache, replay, and validate knowledge data.

New core files:

```txt
database/migrations/0007_data_delivery_governance.sql
data/runtime/runtime_governance_v11.json
data/integration/api_versioning_policy_v11.json
data/integration/export_bundle_contract_v11.json
data/integration/main_site_sync_replay_policy_v11.json
frontend-sdk/pinuyumayanKnowledgeClient.v11.ts
docs/data_delivery_governance_v11.md
```

## v12 Governance Runtime Upgrade

v12 upgrades the backend database service with release channel governance, multi-site API client delivery, data lineage events, quality gate runs, public search export contracts, API SLO policy and governance dashboard metadata.

Key files:

- `database/migrations/0008_multisite_delivery_governance.sql`
- `data/integration/multi_site_delivery_contract_v12.json`
- `data/integration/release_channel_matrix_v12.json`
- `data/integration/search_export_contract_v12.json`
- `data/runtime/sla_slo_policy_v12.json`
- `data/runtime/data_lineage_policy_v12.json`
- `frontend-sdk/pinuyumayanKnowledgeClient.v12.ts`
- `docs/release_channel_governance_v12.md`
- `docs/multisite_integration_v12.md`
- `docs/data_lineage_and_quality_dashboard_v12.md`

The package still keeps `preview_subset = 80` embedded vocabulary/audio rows. The full FormosanBank/ePark corpus remains a post-deploy/background import that must pass release-channel and quality gates before becoming public.


## v13 Admin Auth + Main-site Superadmin Sync + Content Enrichment

v13 adds backend admin login infrastructure and safe superadmin bootstrap/sync flow. It does **not** commit plaintext credentials or reusable default passwords. Bootstrap requires `ADMIN_SUPERUSER_EMAIL`, `ADMIN_SUPERUSER_PASSWORD`, `ADMIN_SESSION_SECRET`, and `PINUYUMAYAN_MAIN_SITE_API_KEY` from the deployment environment or secret manager.

It also adds `data/content/main_site_content_packets_v13.json`, which converts existing verified facts, ten-community records, ritual public summaries and topic pages into website-ready content packets. No new unsourced cultural claims are introduced.

Key commands:

```bash
./deploy/bootstrap-superadmin.sh
python3 scripts/build_content_seed_sql.py
python3 scripts/validate_admin_auth_content_v13.py
```


## v14 Performance + Security + Search Optimization

v14 adds production hardening for the backend data service: cache profiles, ETag policy, API scope guard, search suggestions/facets, search synonyms, admin MFA/password-reset schema, cache invalidation jobs, full-corpus retry queue, and data quality gate result tracking.

New validation:

```bash
python3 scripts/validate_upgrade_optimization_v14.py
```

Apply additive migration:

```bash
mysql "$DATABASE_URL" < database/migrations/0011_performance_security_search_v14.sql
```

The main site should continue to pull data through public-safe API endpoints and internal scoped sync APIs. Direct DB access from the main site remains discouraged.

## v15 Reliability Governance Upgrade

v15 adds main-site SLO tracking, API contract test runs, full corpus reconciliation, public payload snapshots, search index versioning, scoped admin permission grants and security audit events. The embedded vocabulary remains the 80-entry preview subset; the full FormosanBank/ePark corpus is imported after deployment and must pass reconciliation and quality gates before promotion to public release channels.

Key files:

- `database/migrations/0012_observability_scaling_governance_v15.sql`
- `data/integration/main_site_contract_tests_v15.json`
- `data/database/corpus_reconciliation_plan_v15.json`
- `data/runtime/runtime_hardening_v15.json`
- `docs/upgrade_v15_reliability_governance.md`
- `frontend-sdk/pinuyumayanKnowledgeClient.v15.ts`


## v16 Pronunciation-first TTS Runtime

卑南語 TTS 採用「真人來源音檔優先」：主站公開端會先播放 FormosanBank/ePark 已索引的真人語音 URL。沒有真人音檔的任意文字不會直接公開合成音，必須等授權音檔訓練、模型評估與語言教師/族人審核後才能發佈。新增端點：`GET /api/public/pronunciation/:entryId`、`GET /api/public/tts/pronounce`、`POST /api/internal/tts/synthesize`。


## v17 Pronunciation Audio Delivery

v17 adds a real-audio-first pronunciation delivery layer. Public pronunciation playback uses verified FormosanBank/ePark human-recorded source audio. The backend now includes an allowlisted audio proxy, audio manifest, pronunciation search, main-site player SDK, review queue, SQL migration and seed. Synthetic TTS remains disabled for public use unless future licensed training data and native-speaker review pass quality gates.

## v18 Source-grounded AI article publication


v18 adds a no-duplicate, source-grounded article layer for the main site AI.
The AI can use verified source claims plus admin ideas to prepare article draft plans, but it cannot auto-publish.
Every draft must keep source_ids, claim_ids, duplicate fingerprints, sensitivity flags, and human/cultural review status.
New source-grounded claims: 27. New AI article blueprints: 6. Public auto-publish: disabled.


## v19 升級：前端 AI 發文 + 知識庫安全 + 真實知識擴充

### 架構修正

- 新增文章不由後端知識庫生成。
- 前端取得 source packet 後，自行調用 AI provider。
- 後端只負責來源包、去重、引用檢查、敏感內容檢查、審核與發布前檢查。
- `/api/internal/ai-article/draft-plan` 已標記 deprecated。

### 安全強化

- Public API 僅輸出 public / public_summary_only / verified claims。
- Internal API 增加 HMAC nonce/signature 設計。
- source claim read scopes、row security rules、knowledge vault audit logs 已加入 migration。
- 前端 AI 草稿需送回後端驗證，不能直接公開。

### 真實知識擴充

- v19 新增 49 筆去重後 source-grounded claims。
- 合併後 claims 共 76 筆。
- 新增資料涵蓋生業、飲食、服飾、工藝、建築、會所、音樂、舞蹈、族語、親屬制度、年齡階級與公開摘要層級的歲時祭儀。


## v20 True Knowledge Collection + Next Upgrade Plan

- 新增 52 筆（實際數量以 validation 為準）官方來源可追溯 claims，合併後不重複。
- 新增前端 AI Composer source packets；文章仍由前端 AI 產生，後端只做引用、去重、敏感與審核。
- 新增人口資料版本治理：中文官方目前人口與英文 2020 舊人口分開存放。
- 新增 `docs/next_upgrade_plan_v21.md` 與 `data/development/next_upgrade_plan_v21.json`，之後每次完成都附下一版方案。


## v21 Update - Frontend AI Composer + True Knowledge + Forbidden Relation Governance

- 新增可追溯真實 claims：50 筆，合併總數：185 筆。
- 明確禁止將「卑南文化遺址／卑南遺址／卑南考古遺址／Peinan Site／Beinan Site」作為卑南族文化知識來源。
- 文章仍由前端 AI Composer 產生；後端只負責 source packet、引用檢查、去重、禁止關聯檢查、敏感內容檢查與審核。
- 新增下一版方案：`data/development/next_upgrade_plan_v22.json`。


## v22 Frontend AI Composer + Security Upgrade

- 文章新增維持由主站前端／主站 server route 調用 AI provider；後端知識庫不生成文章本文。
- 新增 OpenAI / Kimi / local mock provider adapter contract。
- 新增 client draft citation / duplicate cooldown / forbidden relation / sensitivity validation。
- 新增 HMAC-SHA256 + timestamp + nonce internal API security policy。
- 新增多來源候選 adapter；候選來源不自動公開，且卑南文化遺址相關詞一律禁止作為卑南族文化來源。
- 新增 30 筆可追溯 source-grounded claims；敏感祭儀內容只保留公開摘要與 guardrail。
- 內建下一版 v23 開發方案。


## v23 Main Site Integration

- Added main-site connection kit: env matrix, HMAC/nonce signing, Next.js server AI route examples, SDK bridge, and connection check script.
- Article generation remains on the main site server route. The knowledge backend provides source packets, validation, deduplication, forbidden Beinan/Peinan archaeology relation checks, review and publishing governance.
- Main site must configure `NEXT_PUBLIC_KB_API_URL`, `PINUYUMAYAN_KB_API_URL`, `PINUYUMAYAN_MAIN_SITE_API_KEY`, `PINUYUMAYAN_HMAC_SECRET`, `AI_PROVIDER`, and server-only AI provider key.
- See `docs/main_site_connection_v23.md` and `webapp/env.example`.
