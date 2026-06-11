# 卑南族內容擴充參考（平台可用版）

> 本檔案是「卑南族文化綜合平台」的內容擴充索引。內容採公開資料原創摘要，不取代部落授權、族人複核與學術引用。

## 1. 內容使用原則

1. **先正名，再擴充**：所有內容先依 `references/tribe_name_authority.md` 確認族群名、部落名、羅馬拼音與工程 key。
2. **十社為平台分類主軸**：正式 UI、API、資料庫 seed 一律使用「卑南族十社」。歷史詞只可作註解，不可作主標籤。
3. **祭儀只公開摘要**：少年年祭、大獵祭、祭祖、巫師、家族與禁忌內容，預設 `needs_community_review`。
4. **族語分方言**：南王、知本、西群、建和的語料、語音、例句不可混成單一「標準音」。
5. **來源透明**：資料卡需帶 `source_ids`，對應 `data/source_registry.json`。

## 2. 主要資料檔

| 檔案 | 用途 |
|---|---|
| `data/source_registry.json` | 來源登錄表，記錄原民會與 FormosanBank/ePark 來源 |
| `data/pinuyumayan_communities_expanded.json` | 十社擴充資料、行政位置提示、內容主題、平台摘要 |
| `data/pinuyumayan_rituals.json` | 歲時祭儀與生命禮俗資料卡 |
| `data/pinuyumayan_social_organization.json` | 年齡階級、會所、母系親屬、祭司/巫師等社會制度 |
| `data/pinuyumayan_content_taxonomy.json` | 平台內容分類、route、審核流程與 flag |
| `data/pinuyumayan_content_cards.json` | 可直接匯入 CMS 的內容卡 seed |
| `data/pinuyumayan_knowledge_graph.json` | 社群、祭儀、社會制度、語言方言的關聯圖 |

## 3. 平台內容分類建議

### 3.1 卑南族十社

以十社卡片作為文化平台入口，每張卡片至少包含：

- 中文顯示名
- 羅馬拼音主用版
- 工程 key
- 起源系統
- 行政位置提示
- 常見別名
- 內容主題
- 需複核欄位

### 3.2 歲時祭儀

建議用時間軸呈現：

- 3 月：婦女除草完工慶
- 4 月：祖先登陸與發祥地祭祖
- 7 月：小米收穫祭
- 12 月：年祭、少年年祭、大獵祭
- 時間不定：聯合年祭

前台只公開摘要，詳情分為：公開介紹、部落授權內容、內部管理註記。

### 3.3 社會制度

可拆為 5 個專題：

1. 年齡階級制度
2. 會所制度
3. 母系親屬與家屋觀念
4. 祭司、政治領袖與巫師角色
5. 神靈、祖靈與傳統信仰

### 3.4 生活工藝

可拆為：飲食與小米、服飾與花環、藤竹編、住屋/會所/祖靈屋、農事與產業。

### 3.5 歌謠與藝術

可拆為：祭儀歌謠、休閒工作歌謠、舞蹈與社會角色、現代音樂與演藝人物。

## 4. CMS 欄位建議

```ts
export type PinuyumayanContentCard = {
  id: string
  titleZh: string
  domain: 'identity' | 'communities' | 'rituals' | 'society' | 'material_life' | 'music_arts' | 'language' | 'history'
  summaryZh: string
  suggestedRoute: string
  tags: string[]
  communityKeys: string[]
  sourceIds: string[]
  flags: string[]
  draftStatus: 'draft' | 'needs_editor_review' | 'needs_community_review' | 'published'
}
```

## 5. AI 生成限制

- 不可杜撰祭儀細節、禁忌、家族傳承、巫師能力或部落內部知識。
- 不可把四方言混成同一音系。
- 不可把「Puyuma」直接當作全族品牌。
- 不可把歷史詞作為正式 UI 分類。
- 涉及人物、家族、祭儀、療癒、巫師、祖靈屋等內容，預設輸出「需部落/族人複核」。

## 6. 給 Kimi / Manus / Codex 的使用方式

1. 先讀 `SKILL.md`。
2. 正名與十社先讀 `references/tribe_name_authority.md`。
3. 要生成頁面、卡片、CMS seed 時讀：
   - `data/pinuyumayan_content_taxonomy.json`
   - `data/pinuyumayan_content_cards.json`
4. 要生成部落頁時讀：
   - `data/pinuyumayan_communities_expanded.json`
5. 要生成祭儀頁時讀：
   - `data/pinuyumayan_rituals.json`
6. 要生成族語/音檔功能時讀：
   - `references/formosanbank_audio_integration.md`
   - `data/generated/puyuma_audio_seed.json`
