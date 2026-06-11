---
name: pinuyumayan-expert
description: >
  卑南族（Pinuyumayan）文化、語言與應用開發專家技能。
  請在以下情境主動使用本技能：(1) 回答任何關於卑南族文化、歷史、祭儀、社會組織、語言或詞彙的問題；
  (2) 開發或修改「卑南族文化綜合平台」相關網站、App、資料庫或 AI 知識庫；
  (3) 處理 FormosanBank 卑南語（Puyuma language）語料庫、ILRDF 字典或相關音檔資源；
  (4) 產生任何會提及卑南族（Pinuyumayan）的 AI 摘要、文案或教材；
  (5) 校對卑南族相關內容是否有族名、部落名、方言名稱錯誤。
  本技能強制規範：正確族群與部落命名（嚴禁「普悠瑪族」）、卑南族十社分類、四方言 TTS 支援，
  以及「卑南族文化綜合平台」的 UI/UX、資料結構與 API 命名標準。
---

# Pinuyumayan Expert Skill

> **本技能於 2026 年進行重構**：原始版本為單一大型 SKILL.md，現已拆分為「主檔（本檔案，僅放核心規則與索引）」+ `references/`（依主題分類的詳細資料）。
> 如 reference 檔案中仍有舊版、重複或互相矛盾描述，一律以本檔案的「核心規則」與 `references/tribe_name_authority.md` 為最高優先準則。

---

## 🚨 核心規則（MUST FOLLOW，任何情境都優先適用）

### 1. 族群、部落、語言正名規則

| 項目 | 正確用法 | 禁止用法 |
|---|---|---|
| 對外平台名稱 | **卑南族文化綜合平台** | ~~Pinuyumayan 文化綜合平台~~ 作為中文主標題 |
| 英文品牌/工程代號 | **Pinuyumayan** / `pinuyumayan-*` | 使用 `puyuma-*` 代稱整個族群或平台 |
| 族群名稱 | **卑南族** / **Pinuyumayan** | ~~普悠瑪族~~、將 **Puyuma** 直接當作全族代稱 |
| 部落名稱 | **Puyuma = 南王部落** | 將 Puyuma 寫成整個卑南族 |
| 語言名稱 | 中文寫 **卑南語**；英文語境可寫 **Puyuma language** | 將 Puyuma language 與南王部落混為同一概念 |
| 部落分類 | **卑南族十社** / **Pinuyumayan Ten Communities** | 正式 UI、資料庫、API 中使用「八社」作為分類 |
| 系統模組 | 使用「族群文化系統」「文化內容系統」「文化資料系統」 | 使用未審核的敏感祭儀/家族內容作為公開 UI 主標籤 |

### 2. 卑南族十社權威表

詳細表與異名請以 `references/tribe_name_authority.md` 為準。前台、後台、AI 輸出、資料庫種子資料與 API 回傳都應使用以下主用版：

| 部落（中文） | 羅馬拼音主用版 | 起源系統 | 工程 key 建議 |
|---|---|---|---|
| 南王 | Puyuma | 竹生系統（Panapanayan） | `puyuma` |
| 知本 | Katratripulr | 石生系統（Ruvoahan） | `katratripulr` |
| 建和 | Kasavakan | 石生系統 | `kasavakan` |
| 利嘉 | Likavung | 石生系統 | `likavung` |
| 初鹿 | Ulivelivek | 石生系統 | `ulivelivek` |
| 泰安 | Tamalakaw | 石生系統 | `tamalakaw` |
| 下賓朗 | Pinaski | 石生系統 | `pinaski` |
| 龍過脈 | Danadanaw | 石生系統 | `danadanaw` |
| 班鳩 | Rarangus | 石生系統（常被遺漏，務必列入） | `rarangus` |
| 寶桑 | Papulu | 竹生系統 | `papulu` |

> 注意：Katipul/Katratripulr、Katripul/Katratripulr、Tamalrakaw/Tamalakaw、Mulivelivek/Ulivelivek、Apapolo/Papulu、Pinaseki/Pinaski 等常見異寫，只能作為別名或歷史註記，不得覆蓋主用版。

### 3. 語言與四方言

| 方言 | 卑南語名稱 / 常用標籤 | 起源系統 |
|---|---|---|
| 南王 Nanwang | Puyuma | 竹生系統 |
| 知本 Zhiben | Katratripulr | 石生系統 |
| 建和 Jianhe | Kasavakan | 石生系統 |
| 西群 Xiqun | Ulivelivek 等 | 石生系統 |

- **TTS 規則**：發音規則一律使用英文音標近似法，**禁止**使用注音描述。
- **文字規則**：平台文案與資料庫預設內容使用繁體中文；簡體字只可保留於書名、作品原名或原文引用，並需標註為原文。
- 任何詞彙、教材、TTS 系統皆須區分四方言，不可混用單一腔調作為「標準音」。

### 4. 卑南族文化綜合平台工程命名

| 用途 | 規範 |
|---|---|
| 社群/十社資料表 | `pinuyumayan_communities` |
| tRPC router | `pinuyumayanCommunityRouter` |
| 權限碼 | `pinuyumayan_community.*` |
| 前台顯示 | `卑南族十社` |
| 英文輔助顯示 | `Pinuyumayan Ten Communities` |
| 模組命名 | `族群文化系統`、`文化內容系統`、`文化資料系統` |

---

## 📚 References 索引（依需求查閱，避免一次載入全部）

| 檔案 | 內容範圍 | 何時查閱 |
|---|---|---|
| `references/tribe_name_authority.md` | 卑南族十社正式名稱、羅馬拼音主用版、異名、工程 key | 任何涉及部落名稱、十社、資料庫 seed、API 或 UI 顯示時 |
| `references/pinuyumayan_content_expansion.md` | 卑南族內容擴充索引、CMS 欄位、內容卡、審核流程與 AI 生成限制 | 生成平台內容、CMS seed、部落頁、祭儀頁、內容分類時 |
| `references/knowledge_base_governance.md` | 知識庫治理、來源分級、AI 使用順序、發佈限制 | 擴充知識庫、檢查資料真實性、設定 CMS/AI 發佈規則時 |
| `references/public_content_style_guide.md` | 公開內容寫作語氣、欄位、禁止寫法與建議寫法 | 產生前台文章、內容卡、社群文案時 |
| `references/naming_and_dev_rules.md` | 卑南族文化綜合平台開發規範、頁面功能規格、API 規格、正名規則細節 | 開發/修改網站、撰寫規格書、API 設計時 |
| `references/corpus_and_audio.md` | FormosanBank 語料庫結構、ILRDF 音檔資源、Google Drive 資料夾對照表 | 處理語料、TTS、音檔匹配時 |
| `references/formosanbank_audio_integration.md` | FormosanBank/ePark 卑南語來源、四方言 code、Google Drive 對應語音、manifest schema、同步腳本 | 匯入語料、建立音檔索引、設計族語學習 API 時 |
| `references/society_and_rituals.md` | 社會組織、年齡階級、會所制度、歲時祭儀、生命禮俗、神話、親屬制度 | 文化問答、祭儀內容查核 |
| `references/language_and_grammar.md` | 音韻、文法、動詞焦點系統、各方言比較、借詞、書寫系統 | 語言教學內容、語法校對 |
| `references/vocabulary_by_topic.md` | 主題詞彙、例句、常用句型 | 製作詞彙卡、例句、教材 |
| `references/material_culture.md` | 服飾、紋身、刀具、織布、建築、陶器、竹編等工藝 | 文化內容、工藝介紹 |
| `references/music_and_arts.md` | 傳統歌謠、現代音樂人、文學、舞蹈、影視 | 人物介紹、音樂專題內容 |
| `references/history_and_research.md` | 考古、日治研究、學術文獻、生態知識、貿易史、天文曆法、教科書呈現 | 歷史背景查核、學術引用 |
| `references/modern_development.md` | 現代政治參與、文化復振運動、部落經濟與補助、聯絡資訊 | 時事/政策相關內容 |

**讀取原則**：先看本檔案核心規則；涉及部落名稱時先看 `references/tribe_name_authority.md`；需要細節時再讀取 1–2 個對應 reference 檔案。

---

## 🛠️ 卑南族文化綜合平台開發速覽

完整規格見 `references/naming_and_dev_rules.md`，重點摘要：

- **族語學習頁 (`/language`)**：需有快速存取區、詞彙網格佈局、load more、四方言 TTS 切換、學習進度追蹤與徽章機制。
- **文化內容頁 (`/culture`)**：文化人物需有獨立詳細頁 (`/culture/figures/:id`)；影音媒體分類需含紀錄片、祭儀樂舞；音檔資源優先使用 Google Drive 已分類的 ILRDF/ePark 音檔。
- **部落介紹頁**：正式分類一律為「卑南族十社」，部落卡片以垂直捲動呈現並連結詳細頁。
- **API**：TTS API 須支援 `dialect` 參數（四方言）；詞彙 API 回傳結構化 JSON；十社相關 API 使用 `pinuyumayan_community.*` 權限。

---

## 🎙️ 語料庫與音檔資源速覽

完整內容見 `references/corpus_and_audio.md`，重點：

- **語料來源**：[FormosanBank GitHub](https://github.com/FormosanBank/FormosanBank)（`Corpora/ePark/XML/`，依四方言分檔）。
- **音檔來源**：Google Drive 根資料夾 `1mdzXxD5XQAVLIAdrD5xy3iRI7B3XnlUo`，內含已分類的 ePark 與 ILRDF 字典音檔。
- **解析腳本**：`scripts/parse_puyuma_corpus.py` — 從 GitHub 抓取 XML 語料並與 Google Drive 音檔建立對應關係。

---

## 📝 Manus 交付樣板

需要將審查結果交付給 Manus 或外部開發者進行修復時，使用 `templates/manus_handoff_todo.md` 的 checklist 格式（含 checkbox、嚴重度分級 P0–P2、驗證標準）。

---

## ⚠️ 待辦事項（技能維護備忘）

- [ ] 第二階段去重：`references/music_and_arts.md` 與 `vocabulary_by_topic.md` 仍可能有重複段落；目前採「最新與權威段落優先、舊段落僅作備援」。
- [ ] 持續校正 `references/` 內容與本檔案「核心規則」是否有衝突。
- [ ] `templates/` 目錄持續累積實際使用過的 Manus 交付樣板版本。


## 🔗 FormosanBank/ePark 擴充規則

- 卑南語 ePark code 固定為：38 南王、39 知本、40 西群、41 建和。
- CSV/XML 來源清單以 `data/formosanbank_sources.json` 為準。
- 音檔 manifest 欄位以 `data/audio_manifest_schema.json` 為準。
- 已抽出的可測試 seed 在 `data/generated/puyuma_audio_seed.json`。
- 完整同步流程使用 `scripts/sync_formosanbank_puyuma.py` 與 `scripts/build_puyuma_audio_manifest.py`。
- Google Drive 對應語音 folder id：`1o_iEc2dbet-cENHLjv86R_b67M0TlakZ`。若無權限，需先改成公開、登入 gdown，或改用本機掛載後再建 manifest。

## 🧩 內容擴充資料速覽

- `data/pinuyumayan_communities_expanded.json`：十社擴充資料，可用於部落頁、地圖點位、搜尋 alias 與 CMS seed。
- `data/pinuyumayan_rituals.json`：祭儀資料卡，預設僅公開摘要，細節需部落/族人複核。
- `data/pinuyumayan_social_organization.json`：年齡階級、會所、母系親屬、祭司/巫師與信仰等社會制度。
- `data/pinuyumayan_content_cards.json`：已整理的 CMS 內容卡 seed，產生前台頁面時優先使用。
- `data/pinuyumayan_knowledge_graph.json`：社群、祭儀、社會制度與語言方言的關聯圖。

內容生成時，若 `flags` 包含 `needs_community_review`，不得宣稱內容已可公開定稿。



## 真實資料與來源規則（2026-06-11 verified expansion）

- 新增內容必須先進入 `data/verified_pinuyumayan_facts.json` 或對應資料表，且每筆都要有 `source_ids`。
- 公開前台、AI 回答、CMS 文章只可使用 `verification_status=verified_public` 或 `community_reviewed` 的資料。
- `sensitivity=high` 的內容，例如祭儀細節、祖靈、家族制度、巫師知識，只能做公開摘要，不得生成操作教學。
- 不確定、未授權、來源互相衝突的內容要標成 `community_review_required` 或 `disputed_or_uncertain`，不可寫成定論。
- 主要查核規則見 `references/verified_source_protocol.md`。
- 來源對照見 `data/source_registry.json` 與 `data/source_evidence_map.json`。


## ✅ Knowledge base governance

- 回答或生成任何卑南族內容前，先依 `data/knowledge_base_index.json` 判斷需要讀取的 facts、references 與 source。
- 文化事實必須優先使用 `data/verified_pinuyumayan_facts.json` 與 `data/source_claim_matrix.json`，不可自行編造。
- 高敏感內容包含祭儀流程、祖靈、巫師、家族譜系、會所訓練與禁忌，一律 summary only，正式公開前需部落/族人複核。
- 發佈前執行 `python3 scripts/validate_knowledge_base.py`。

## Website vocabulary/audio rules

- For website vocabulary/audio pages, read `data/web/puyuma_vocabulary_audio_entries.json` first.
- Use only entries where `audio.url` exists and `source.verification_status` is `verified_public_source`.
- Do not invent MP3 URLs, speaker identities, dialect names, or translations.
- Use `<audio controls preload="none">` for public UI examples.
- Before bulk downloading or rehosting audio, require separate license review.
- Route examples and component examples are in `webapp/`.

## 網站知識庫應用層

若任務是建立網站頁面、FAQ、搜尋、SEO、學習路徑或 CMS 內容，優先讀取：

1. `data/web/pinuyumayan_topic_pages.json`
2. `data/web/pinuyumayan_faq.json`
3. `data/web/pinuyumayan_learning_paths.json`
4. `data/web/pinuyumayan_timeline_events.json`
5. `data/web/pinuyumayan_sensitive_content_rules.json`
6. `references/web_knowledge_application.md`

所有輸出必須保留 source_ids；高敏感內容只做摘要，不產生祭儀流程、禁忌、巫師作法、家族譜系、狩獵教學或未授權歌詞。


## 網站語詞庫全量匯入 / TTS / G2P / IPA

- 網站語詞庫主檔：`data/web/puyuma_vocabulary_audio_entries.json`。
- 每筆 entry 應含 `audio.url`、`g2p.phoneme_sequence`、`ipa.value`、`tts.tts_text`。
- 完整來源清單：`data/web/puyuma_vocabulary_full_source_manifest.json`，目前列出 FormosanBank/ePark 22 個 CSV 與 44 個 XML 候選來源。
- 全量建置：`python3 scripts/build_full_puyuma_web_vocabulary.py --download`。
- TTS 預設不得公開啟用；必須優先播放來源真人音檔。
- G2P / IPA 是規則式草稿，公開教學前需語言專家審核。

## Corpus scale rule: embedded subset vs. full FormosanBank/ePark corpus

Do not describe `data/web/puyuma_vocabulary_audio_entries.json` as the complete Puyuma corpus unless it has been regenerated by `scripts/build_full_puyuma_web_vocabulary.py --download` and validated by `scripts/audit_puyuma_corpus_sources.py`.

Default ZIP status:

- Embedded website preview subset: 80 entries.
- Full source manifest: 66 FormosanBank/ePark candidate source files.
- Audio policy: audio URLs are included; MP3 binaries are not bundled.
- G2P/IPA policy: rule-based draft; expert review required.
- TTS policy: metadata only; public TTS disabled until review.

When asked about corpus size, answer with both numbers:

1. Current bundled website entries.
2. Full source candidate pipeline and the generated audit count if available.

Never fabricate “thousand entries” inside the ZIP. Generate them from source or mark them as not yet generated.


## Full Puyuma corpus pipeline v2

這版新增 `references/full_corpus_build_runbook.md` 與 `scripts/validate_full_puyuma_corpus_output.py`。全量匯入時，XML `<PHON>` 會保存到 `ipa.source_phon`，CSV 沒有 PHON 時才使用規則式 G2P/IPA 草稿。

正式宣稱「千筆級語料已匯入」前，必須在可連線環境執行：

```bash
python3 scripts/build_full_puyuma_web_vocabulary.py --download --min-entries 1000
python3 scripts/validate_full_puyuma_corpus_output.py data/web/puyuma_vocabulary_audio_entries.json --min-entries 1000 --require-all-dialects --require-source-phon
```

目前 ZIP 內仍保留 80 筆 preview seed；完整筆數以 `puyuma_full_corpus_build_summary.generated.json` 的 `deduped_entry_count` 為準。
## Database Layer Rules

- 建立網站資料庫時，優先讀取 `data/database/pinuyumayan_database_schema.json` 與 `data/database/pinuyumayan_mysql_tidb_schema.sql`。
- 語料表必須區分 `preview_subset` 與 `full_corpus`，不得把 80 筆 preview 當成千筆級完整語料。
- 所有 facts、FAQ、topic pages、corpus entries 必須保留來源欄位。
- 音檔鏡像到 R2/S3/CDN 前必須先通過授權審核。
- TTS 預設不得公開，除非通過族語/部落審核。


## Database Ops v4 使用規則

- 後台必須區分 `preview_subset` 與 `full_corpus`，不得把 80 筆 preview 語料稱為完整千筆語料。
- 對外公開前需讀取 `data/database/review_queue_seed.json` 與 `data/database/content_status_workflow.json`。
- 音檔鏡像、TTS 公開、G2P/IPA 正式教學都必須通過審核。
- SQL views 只可公開 approved 且可公開層級的資料。
- 新增文化內容時，必須先補來源與審核狀態，再進入前台。
