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


## v24 Main Site Runtime Bridge

v24 新增主站可搬用的 server-side AI Composer、HMAC internal client、連線檢查、文章審核工作台範例、SEO 發布檢查與 full corpus 驗收規格。文章正文仍由主站 server route 呼叫 AI provider；後端知識庫只做史料包、引用、去重、敏感、授權、禁止關聯與審核治理。

新增主要文件：

- `docs/main_site_runtime_bridge_v24.md`
- `docs/hmac_internal_api_enforcement_v24.md`
- `docs/full_corpus_acceptance_v24.md`
- `docs/next_upgrade_plan_v25.md`

新增主站可搬檔案：

- `webapp/lib/kbHmacClient.v24.ts`
- `webapp/app/api/ai/compose-v24/route.ts`
- `webapp/app/api/kb/connection-check/route.ts`
- `webapp/components/ArticleComposerV24.tsx`
- `webapp/components/AdminArticleReviewWorkbenchV24.tsx`

## v25 Main-site deployable bridge

v25 turns the v24 connection kit into a more deployable main-site bridge: copyable server-side AI route, HMAC client, article review action API, HMAC verification endpoint, SEO publish check, full-corpus acceptance report schema, and a v26 upgrade plan. Article body generation remains on the main-site server route; the knowledge backend only provides source packets, validation, deduplication, forbidden-relation checks, review governance, and publication controls.


## v26 VPS DB Production Core

資料庫預設部署在使用者 VPS。v26 新增 DB-backed admin auth、internal API HMAC + nonce 防重放、文章審核 DB transaction、VPS DB 狀態/備份紀錄、以及 v27 下一步方案。文章仍由主站 server-side AI route 生成，後端知識庫只做史料、引用、去重、安全、審核與發布治理。


## v27 VPS staging / full corpus / search / fallback upgrade

- DB remains VPS-first: MySQL/MariaDB on localhost/private LAN.
- Adds VPS staging full-corpus acceptance evidence; current embedded preview report honestly fails the >=1000 gate until the pipeline is run on VPS staging.
- Adds production DB/static fallback policy: production DB-backed routes must not silently serve stale JSON.
- Adds MySQL FULLTEXT-oriented search index tables and ops endpoints.
- Adds backup restore drill evidence tables and report endpoint.
- Adds admin UI integration checklist for login/review/corpus/search/security dashboards.
- Forbidden relation remains enforced: 卑南文化遺址 / Beinan Site / Peinan Site must not become Pinuyumayan cultural knowledge source.


## v28 VPS Live Ops / Search / Fallback Upgrade

v28 continues the VPS DB architecture and adds an executable staging flow for full corpus acceptance, production DB fallback enforcement, MySQL FULLTEXT index building, live admin ops dashboard wiring, VPS restore drills, and source candidate review policy. The embedded package still contains only the 80-entry preview subset; the >=1000 full corpus must be executed on the user VPS staging environment and must pass acceptance before promotion.

Key files:
- `deploy/vps-full-corpus-staging-v28.sh`
- `scripts/build_vps_full_corpus_acceptance_v28.py`
- `scripts/build_mysql_fulltext_index_v28.py`
- `backend/src/rest/vpsLiveOpsV28Routes.ts`
- `backend/src/lib/productionDbFallbackV28.ts`
- `database/migrations/0025_vps_live_ops_search_fallback_v28.sql`
- `docs/vps_live_ops_v28.md`
- `data/development/next_upgrade_plan_v29.json`


## v29 VPS Actual Ops / DB-backed live operations

v29 turns the VPS staging plan into executable operational files. It does not claim to have run on the user VPS. Run `deploy/vps-run-full-corpus-v29.sh` on the VPS staging environment to produce a real >=1000 acceptance report or an explicit failure report. v29 also adds DB-backed full corpus run records, search index population runs, fallback route coverage audit, backup restore checksum reports, and source candidate human-review tables.

Key files:
- `deploy/vps-run-full-corpus-v29.sh`
- `deploy/vps-backup-restore-checksum-v29.sh`
- `scripts/verify_vps_env_v29.py`
- `scripts/build_search_index_population_v29.py`
- `backend/src/rest/vpsActualOpsV29Routes.ts`
- `database/migrations/0026_vps_actual_ops_v29.sql`
- `docs/vps_actual_ops_v29.md`
- `data/development/next_upgrade_plan_v30.json`


## v30 Production Cutover / 正式上線切換

新增 DNS/TLS/Nginx/systemd/CORS/HMAC/DB backup/rollback/main-site acceptance/SEO/search quality 檢查層。DB 預設仍在 VPS，production 必須使用 `KNOWLEDGE_DATA_MODE=db` 並關閉靜默 static fallback。


## v31 Production Dry-run / 正式上線演練層

v31 將 v30 的正式切換 checklist 轉成可在 VPS staging 執行的 dry-run 報告流程。新增重點：

- VPS production dry-run checklist 與 generated report schema
- 主站搬移驗收規格與 secret scan 要求
- `/api/internal/*` HMAC + nonce 覆蓋矩陣
- full corpus acceptance report 回填流程，仍不把 80 筆 preview 假裝成千筆
- 後台 live dashboard binding 規格
- 搜尋品質與卑南文化遺址禁止關聯 smoke suite
- v32 下一次完善方案

v31 仍維持：DB 在 VPS、正式環境禁用靜默 static fallback、後端知識庫不生成文章正文、Beinan/Peinan archaeology terms 不得作為卑南族文化來源。

## v32 VPS Dry-run Backfill + HMAC Enforcement

- Adds VPS dry-run report backfill plan and generated-report ingestion flow.
- Registers HMAC enforcement middleware for `/api/internal/*`.
- Adds main-site secret scan policy so AI/HMAC/API secrets stay server-side.
- Adds full corpus backfill contract; preview subset remains 80 and must not be claimed as 1000+.
- Adds search/SEO validation suite and production static fallback enforcement policy.

## v33 Expanded Source Search / 知識庫擴大搜尋

- 新增多來源搜尋候選管線：TIPP、國家文化記憶庫、族語詞典、臺東地方來源、學術 metadata。
- 新增 36 筆 verified/policy claims、public cards、search documents、frontend source packets。
- 延續卑南文化遺址 / Beinan Site / Peinan Site 禁止關聯。
- 候選來源不自動公開，需授權、去重、敏感內容與人工審核。


## v34：擴大搜尋相關真實知識

新增 46 筆 source-grounded claims、8 組多來源候選、v34 public cards/search documents/source packets，並延續卑南文化遺址/Beinan Site 禁止關聯治理。


## v35：卑南族歌謠／古調／歌曲／YouTube 來源候選

新增音樂與 YouTube metadata 候選管線。平台只保存來源 metadata、URL、頻道與審核狀態；不保存完整歌詞，不下載音訊/影片，不把 YouTube 音軌納入 TTS 或模型訓練。


## v36 歌曲/歌謠 metadata 擴充

- 新增 v36 songs/chant metadata catalog：42 筆候選。
- 新增 v36 source-grounded claims：67 筆。
- 只保存 metadata，不保存完整歌詞、不下載音檔、不拿未授權音源訓練 TTS。
- 卑南文化遺址 / Beinan Site / Peinan Site 仍列為禁止關聯。


## v37 music folk song catalog

- 新增歌謠/古調/歌曲 metadata claims：54
- 新增歌曲候選：32
- 合併 claims：472
- 不保存歌詞、不下載音訊、不做未授權訓練。


## v38 歌謠／古調深度擴充
- 新增 40 筆歌謠/古調 metadata 補欄候選，總 catalog 114 筆。
- 新增 55 筆 claims，合併後 527 筆。
- 延續 metadata-only：不保存完整歌詞、不下載音訊、不做未授權訓練。
- 新增 v39 下一版開發方案。


## v39 歌謠／歌曲／古調擴充

- 新增歌謠/歌曲/古調 metadata 候選、來源登錄、權利政策、審核佇列與 AI source packets。
- 僅保存 metadata，不保存完整歌詞、不下載音訊/影片、不做未授權 TTS/歌聲模型訓練。
- 延續卑南文化遺址禁止關聯規則。


## v40 歌曲／歌謠／古調擴充

- 新增歌曲/歌謠/古調 metadata 候選、來源登錄、權利政策、YouTube metadata worker、審核佇列與 AI source packets。
- 僅保存 metadata，不保存完整歌詞、不下載音訊/影片、不做未授權 TTS/歌聲模型訓練。
- 延續卑南文化遺址禁止關聯規則。


## v41 TTS/STT 訓練與音樂營運落地

- 新增 TTS/STT 訓練治理與候選 manifest。
- YouTube Data API worker 僅抓 metadata，不下載音訊/影片。
- 完成 v40 下一步 1–6 項：worker、審核 UI、權威來源 adapter、MySQL FULLTEXT、AI 音樂防護、VPS DB transaction contract。
- 公開合成 TTS 仍關閉；未授權音樂與 YouTube 音源不得訓練。

## v42 TTS/STT 評估與音樂搜尋
- 新增授權資料審核、train/dev/test split、MOS/WER/CER 評估報告 schema。
- 新增 `/api/public/search/music` 與 MySQL FULLTEXT 音樂索引產生器。
- YouTube/歌曲音源仍禁止下載、訓練與公開複製；只允許 metadata 候選。

## v43 TTS/STT Live Music Ops

- Adds licensed speech review, model experiment workspace, MOS/WER/CER dashboard and public release gates.
- Adds music live DB search contract and authority-source metadata fetch contract.
- Public TTS/STT remains disabled until authorization, consent, alignment and human review pass.
- YouTube audio/video and complete lyrics remain blocked.
