# 語料庫與音檔資源 (Corpus & Audio Resources)

> **整理說明**：本檔案內容來自舊版 SKILL.md（v15–v29 累積的研究筆記），
> 已依主題粗分類至此檔案。內容尚未去重、未校對最新版本是否有衝突，
> 使用時如發現同一主題有多處重複描述，請以 `SKILL.md` 的核心規則、`references/tribe_name_authority.md` 與本檔案的「⭐ 權威版本」為最高優先準則，其餘內容僅供參考查詢。

---

## 目錄（本檔案涵蓋主題）

- FormosanBank Corpus & Audio Resources
- 二、FormosanBank 語料庫中的卑南族歌謠錄音資料
- 卑南語數位學習工具評比
- 卑南族各部落間的差異（南王/知本/建和/初鹿）
- 前言

---

## FormosanBank Corpus & Audio Resources

**XML Corpus Location**: clone FormosanBank to the path configured by `FORMOSANBANK_REPO_DIR`; XML root defaults to `external/FormosanBank/Corpora/ePark/XML/`.
Subdirectories per dialect: `Nanwang_Puyuma.xml`, `Zhiben_Puyuma.xml`, `Jianhe_Puyuma.xml`, `Xiqun_Puyuma.xml`

**Audio Resources (Google Drive)** — ✅ VERIFIED: All 6,648 files confirmed as Puyuma language（卑南語）-language-only（卑南語） (0 non-Puyuma files):
Root Folder ID: `1mdzXxD5XQAVLIAdrD5xy3iRI7B3XnlUo`

| Category | Drive Folder ID | Nanwang | Zhiben | Jianhe | Xiqun | Total |
|----------|----------------|---------|--------|--------|-------|-------|
| ep1_九階教材 | `1_Tq3vumPRAOPvIxZPHfBsQ3O9SVufH0d` | 0 | 0 | 1,000 | 0 | 1,000 |
| ep2_文化篇 | `1U8yvI1jaLRAlE9nJZoxOI_YnpXP3SKw7` | 0 | 0 | 777 | 223 | 1,000 |
| ep2_生活會話篇 | `1vKRsHvyprVDfAjBX057OvCnjDwU3FzRS` | 0 | 0 | 754 | 246 | 1,000 |
| ep2_情境族語 | `1HdsHtjsKRMdS6N7GWgIixfG_VUnV-8_X` | 0 | 0 | 906 | 94 | 1,000 |
| ep2_閱讀書寫篇 | `1HJbFL8y6ZjdI0Vc3MbXFm9X32MJqkMb9` | 0 | 0 | 689 | 311 | 1,000 |
| ep2_族語短文 | `1BwBcThAEAVQrOqjHlLDycgsM0b5LCAzV` | 162 | 162 | 162 | 162 | 648 |
| ILRDF_字典 | `1o_iEc2dbet-cENHLjv86R_b67M0TlakZ` | — | — | — | — | 1,000 |
| **合計** | | **162** | **162** | **4,288** | **1,036** | **6,648** |

*Note: ILRDF audio files are named `Puyuma_XXXX.mp3` without dialect prefix. Use `gws` CLI to access.*

Total corpus: **27,018 sentences** across 10 categories. Parse script: `scripts/parse_puyuma_corpus.py`.

| Category | Dir Name | Sentences |
|----------|----------|-----------|
| 學習詞表 | `xue_xi_ci_biao_learning_vocabulary` | 4,364 |
| 文化篇 | `wen_hua_pian_cultural_section` | 3,900 |
| 生活會話 | `sheng_huo_hui_hua_pian_daily_conversation` | 3,167 |
| 情境族語 | `qing_jing_zu_yu_contextual_indigenous_language` | 3,701 |
| 閱讀書寫 | `yue_du_shu_xie_pian_reading_writing` | 3,327 |
| 句型篇高中 | `ju_xing_pian_gao_zhong_sentence_patterns_senior_high` | 3,457 |
| 句型篇國中 | `ju_xing_pian_guo_zhong_sentence_patterns_junior_high` | 2,404 |
| 九階教材 | `jiu_jie_jiao_cai_nine_level_materials` | 1,804 |
| 族語短文 | `zu_yu_duan_wen_indigenous_language_essays` | 648 |
| 圖畫故事 | `tu_hua_gu_shi_pian_picture_story` | 246 |

Each sentence includes: original/standard romanization, IPA phonetics, Chinese & English translation, audio URL.

## 二、FormosanBank 語料庫中的卑南族歌謠錄音資料

FormosanBank語料庫是一個致力於保存和復振台灣原住民族語言的大型數據驅動計畫。該語料庫集結了各類文本和錄音資料，旨在支持語言學研究、語言教育和族語復振工作。根據FormosanBank的資料顯示，卑南語語音錄製時間長度為71小時8分鐘6秒，詞元數量為340,520 [2]。雖然FormosanBank語料庫中包含大量的卑南語語音資料，但目前尚未明確指出其中有多少比例是專屬於「歌謠」的錄音資料。這部分仍需進一步的篩選與確認。

## 卑南語數位學習工具評比

### 1. 族語E樂園（原住民族委員會）

族語E樂園是由原住民族委員會建置的線上學習平台，提供豐富的族語學習資源，其中包含卑南語課程。其內容涵蓋基礎會話、歌謠、句型練習及故事動畫等多元形式。在卑南語課程方面，族語E樂園致力於涵蓋不同方言腔調，但實際資源分布仍有側重。

#### 課程內容評比（南王/知本/建和/初鹿四腔）

根據收集到的資料，族語E樂園的卑南語課程主要集中在**南王卑南語**和**知本卑南語**，而**建和卑南語**和**初鹿卑南語**的資源相對較少，或以「西群卑南語」統稱。

*   **南王卑南語 (Puyuma)**：擁有較為豐富的課程內容，包括基礎入門、歌謠、基本句型及圖畫故事等。例如，「空中族語教室-12卑南族南王卑南語」系列影片提供了從書寫符號到基本句型的詳細教學。
*   **知本卑南語 (Katipul)**：亦有一定數量的歌謠和句型課程，例如「歌謠篇 知本卑南語」系列。
*   **建和卑南語 (Kasavakan)**：課程數量較少，主要以歌謠為主。
*   **初鹿卑南語 (Ulivelivek)**：在族語E樂園中，初鹿卑南語的專屬課程較為稀缺，部分內容可能被歸類於「西群卑南語」中。

**優點**：
*   官方平台，內容具權威性與正確性。
*   課程形式多樣，包含影片、歌謠、動畫，增加學習趣味性。
*   部分課程針對不同方言腔調進行標示，有助於學習者辨識。

**缺點**：
*   各方言腔調資源分布不均，初鹿及建和腔調資源較少。
*   課程體系化程度有待加強，學習路徑不夠明確。
*   互動性較低，缺乏即時練習與回饋機制。

**官方網址**：[族語E樂園](https://web.klokah.tw/)

### 2. FormosanBank 語料庫

FormosanBank語料庫是一個集結台灣南島語言語料的平台，旨在支持語言學研究、語言教育和族語復振工作。其卑南語語料庫包含大量的文本和錄音，為深度語言分析提供了豐富的資源。

#### 使用方式與資源豐富度

FormosanBank語料庫的卑南語部分，截至目前已涵蓋340,520個詞元，並有71小時8分鐘6秒的語音錄音。這些語料主要來自「族語E樂園」和「原語會族語線上辭典」等來源，經過整理與標註，方便研究者進行檢索與分析。

**優點**：
*   語料規模龐大，提供豐富的真實語言數據。
*   語料經過整理與標註，有助於語言學研究與分析。
*   提供語音錄音，有助於學習者掌握發音。

**缺點**：
*   主要為研究用途，對於一般初學者而言，使用門檻較高。
*   缺乏系統性的教學引導，不適合作為獨立的學習工具。
*   語料庫的檢索功能可能需要一定的語言學背景才能有效利用。

**官方網址**：[FormosanBank語料庫](https://ai4commsci.gitbook.io/formosanbank/zh/yu-liao-ku-jia-gou/yu-liao-ku)

### 3. 原住民族語言研究發展基金會（ILRDF）線上辭典

原住民族語言研究發展基金會（ILRDF）提供的線上辭典是一個重要的卑南語詞彙查詢工具。它提供了卑南語詞彙的羅馬拼音、中文翻譯及相關例句，有助於學習者理解詞義與用法。

#### 功能與內容評比

ILRDF線上辭典的卑南語部分，收錄了大量的詞彙，並可依卑南語方言進行篩選。例如，查詢「你好」會顯示不同方言的表達方式。

**優點**：
*   詞彙量豐富，涵蓋多個卑南語方言。
*   提供羅馬拼音與中文翻譯，方便查詢。
*   部分詞彙附有例句，有助於理解實際應用。

**缺點**：
*   主要功能為詞彙查詢，缺乏語法解釋與系統性學習內容。
*   例句數量有限，無法滿足深度學習需求。
*   界面設計較為樸素，互動性有待提升。

**官方網址**：[原住民族語言線上辭典](https://e-dictionary.ilrdf.org.tw/)

### 4. YouTube 上的卑南語教學影片資源

YouTube作為全球最大的影音平台，也存在許多由個人或團體上傳的卑南語教學影片。這些影片內容多樣，從基礎發音、單詞教學到歌曲演唱、文化介紹等。

#### 資源豐富度與內容評比

YouTube上的卑南語教學影片資源豐富，其中「台灣原住民的故事」頻道下的「Puyuma 卑南族 ─ 語言 族語教學」播放清單提供了大量的南王卑南語教學影片，涵蓋基礎入門、基本句型及句型結構等。

**優點**：
*   內容形式自由多樣，可找到不同風格的教學影片。
*   許多影片由族人自行製作，更具在地性與親切感。
*   免費且易於取得，隨時隨地皆可學習。

**缺點**：
*   內容品質參差不齊，缺乏統一的教學標準。
*   影片內容可能未經系統性規劃，學習路徑不連貫。
*   部分影片可能年代久遠，畫質或音質不佳。
*   難以確保內容的方言腔調歸屬，可能混淆學習者。

**YouTube 影片連結**：
[空中族語教室-12卑南族南王卑南語-01基礎入門篇-01 書寫符號](https://www.youtube.com/watch?v=moQylUg2zfg)
[空中族語教室 12卑南族南王卑南語 01基礎入門篇 單元02 歌唱學族語一](https://www.youtube.com/watch?v=OI0MnC9ZytY)
[空中族語教室 12卑南族南王卑南語 01基礎入門篇 單元03 歌唱學族語二](https://www.youtube.com/watch?v=U-LI9uv2bTI)
[空中族語教室-12卑南族南王卑南語-01基礎入門篇-04 大魚的嘴巴](https://www.youtube.com/watch?v=7IwFb_0Rvvg)
[空中族語教室-12卑南族南王卑南語-01基礎入門篇-05 跟著Umaw去打獵](https://www.youtube.com/watch?v=bKHYUNC1fmY)
[空中族語教室-12卑南族南王卑南語-02基本句型篇-01 我是卑南族小孩](https://www.youtube.com/watch?v=Ggf1IbUbpw4)
[空中族語教室-12卑南族南王卑南語-02基本句型篇-02這些芒果很甜](https://www.youtube.com/watch?v=GRB2Lc6PSII)
[空中族語教室-12卑南族南王卑南- 02基本句型篇-03 春天到了](https://www.youtube.com/watch?v=y0rg3ADu5Q0)
[空中族語教室-12卑南族南王卑南語-02基本句型篇-04月亮出來了](https://www.youtube.com/watch?v=tq9g772a-1I)
[空中族語教室-12卑南族南王卑南語-02基本句型篇-05我們部落有小孩](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-02基本句型篇-06我們來吃芒果](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-02基本句型篇-07學校放暑假了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-02基本句型篇-08 Pundik的爸爸帶他](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-01 爸爸要帶我去森林](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-02 我們去森林裡打獵](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-03 不要笑我](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-04 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-05 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-06 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-07 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-08 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-09 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-10 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-11 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-12 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-13 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-14 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-15 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-16 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-17 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-18 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-19 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-20 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-21 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-22 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-23 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-24 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-25 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-26 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-27 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-28 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-29 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-30 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-31 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-32 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-33 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-34 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-35 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-36 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-37 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-38 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-39 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-40 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-41 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-42 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-43 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-44 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-45 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-46 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-47 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-48 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-49 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-50 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)

### 5. 各工具的優缺點比較表

| 工具名稱           | 優點                                       | 缺點                                       |
| :----------------- | :----------------------------------------- | :----------------------------------------- |
| 族語E樂園          | 官方權威、內容多樣、方言標示明確           | 資源分布不均、體系化不足、互動性低         |
| FormosanBank語料庫 | 語料規模龐大、數據豐富、有語音錄音         | 學習門檻高、缺乏教學引導、檢索需專業背景   |
| ILRDF線上辭典      | 詞彙量豐富、涵蓋多方言、羅馬拼音與中文對照 | 缺乏語法解釋、例句有限、互動性待提升       |
| YouTube教學影片    | 內容形式自由、在地化、免費易取得           | 品質參差不齊、系統性不足、方言歸屬難辨識   |

### 6. 適合不同學習階段的工具推薦

*   **初學入門者**：推薦使用**族語E樂園**的基礎課程和歌謠，搭配**YouTube教學影片**中較為活潑生動的入門內容。這些工具能提供較為輕鬆愉快的學習體驗，幫助建立對卑南語的興趣。
*   **進階學習者**：在掌握基礎後，可深入使用**族語E樂園**的句型練習和故事動畫，並結合**ILRDF線上辭典**進行詞彙擴充和語法理解。此階段的學習者需要更系統性的內容來提升語言能力。
*   **研究與專業人士**：**FormosanBank語料庫**是進行語言學研究、語音分析和深度語法探討的寶貴資源。對於希望深入了解卑南語結構和語音特徵的專業人士，語料庫提供了豐富的原始數據。

## 卑南族各部落間的差異（南王/知本/建和/初鹿）

卑南族主要分為八個社，語言上則有四大方言群：南王（Puyuma）、知本（Katipul）、建和（Kasavakan）和初鹿（Ulivelivek）。這些方言群在語音、詞彙和部分語法結構上存在差異，反映了各部落在歷史發展和地域隔離下的語言演變。雖然本研究主要關注數位學習工具，但理解這些方言差異對於選擇合適的學習資源至關重要。

*   **南王（Puyuma）**：通常被視為卑南語的代表性方言，擁有較多的文獻和教學資源。其語音和詞彙相對穩定，是許多學習工具優先涵蓋的對象。
*   **知本（Katipul）**：與南王方言有一定程度的相似性，但在某些音韻和詞彙上有所區別。在數位資源中，知本方言的內容也相對較多。
*   **建和（Kasavakan）**：其方言特徵與南王和知本有所不同，資源相對較少。學習者在尋找建和方言的學習材料時，可能需要花費更多時間。
*   **初鹿（Ulivelivek）**：是卑南語中資源最為稀缺的方言之一，其獨特的語音和詞彙使其學習難度相對較高。目前數位學習工具對初鹿方言的覆蓋率最低，這也凸顯了未來發展的潛力與需求。

這些方言差異的存在，使得卑南語的數位學習工具需要更細緻的規劃，以確保各方言群的學習者都能獲得充足且準確的資源。目前，多數工具仍以南王方言為主要內容，其他方言的資源有待進一步開發與整合。


#### 語言例句對照表
| 卑南語（羅馬拼音） | 中文翻譯 | 說明 |
| :----------------- | :------- | :--- |
| `aya`              | 你好     | 一般問候語 |
| `adi`              | 再見     | 告別語 |
| `masi`             | 謝謝     | 表達感謝 |
| `uri`              | 是       | 肯定回答 |
| `ini`              | 不是     | 否定回答 |
| `kama`             | 爸爸     | 稱謂 |
| `ina`              | 媽媽     | 稱謂 |
| `valanga`          | 朋友     | 稱謂 |
| `tuku`             | 學習     | 動詞 |
| `pinuyumayan`      | 卑南族   | 族群名稱 |


#### 關鍵術語
| 卑南語 | 羅馬拼音 | 中文 | 說明 |
| :----- | :------- | :--- | :--- |
| `Puyuma` | Puyuma   | 卑南 | 卑南族自稱，亦指南王部落 |
| `Katipul` | Katipul  | 知本 | 卑南族知本部落 |
| `Kasavakan` | Kasavakan | 建和 | 卑南族建和部落 |
| `Ulivelivek` | Ulivelivek | 初鹿 | 卑南族初鹿部落 |
| `Ina`    | Ina      | 母親 | 對母親的稱呼 |
| `Kama`   | Kama     | 父親 | 對父親的稱呼 |
| `Vangavang` | Vangavang | 青年會 | 卑南族傳統組織，負責部落事務 |
| `Malataw` | Malataw  | 祭師 | 卑南族傳統信仰中的重要角色 |
| `Sarama` | Sarama   | 豐年祭 | 卑南族最重要的祭典，感謝豐收 |
| `Pinaskian` | Pinaskian | 猴祭 | 卑南族少年晉級成年禮前的訓練儀式 |


#### 相關影音連結
[空中族語教室-12卑南族南王卑南語-01基礎入門篇-01 書寫符號](https://www.youtube.com/watch?v=moQylUg2zfg)
[空中族語教室 12卑南族南王卑南語 01基礎入門篇 單元02 歌唱學族語一](https://www.youtube.com/watch?v=OI0MnC9ZytY)
[空中族語教室 12卑南族南王卑南語 01基礎入門篇 單元03 歌唱學族語二](https://www.youtube.com/watch?v=U-LI9uv2bTI)
[空中族語教室-12卑南族南王卑南語-01基礎入門篇-04 大魚的嘴巴](https://www.youtube.com/watch?v=7IwFb_0Rvvg)
[空中族語教室-12卑南族南王卑南語-01基礎入門篇-05 跟著Umaw去打獵](https://www.youtube.com/watch?v=bKHYUNC1fmY)
[空中族語教室-12卑南族南王卑南語-02基本句型篇-01 我是卑南族小孩](https://www.youtube.com/watch?v=Ggf1IbUbpw4)
[空中族語教室-12卑南族南王卑南語-02基本句型篇-02這些芒果很甜](https://www.youtube.com/watch?v=GRB2Lc6PSII)
[空中族語教室-12卑南族南王卑南- 02基本句型篇-03 春天到了](https://www.youtube.com/watch?v=y0rg3ADu5Q0)
[空中族語教室-12卑南族南王卑南語-02基本句型篇-04月亮出來了](https://www.youtube.com/watch?v=tq9g772a-1I)
[空中族語教室-12卑南族南王卑南語-02基本句型篇-05我們部落有小孩](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-02基本句型篇-06我們來吃芒果](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-02基本句型篇-07學校放暑假了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-02基本句型篇-08 Pundik的爸爸帶他](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-01 爸爸要帶我去森林](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-02 我們去森林裡打獵](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-03 不要笑我](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-04 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-05 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-06 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-07 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-08 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-09 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-10 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-11 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-12 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-13 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-14 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-15 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-16 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-17 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-18 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-19 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-20 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-21 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-22 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-23 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-24 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-25 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-26 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-27 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-28 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-29 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-30 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-31 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-32 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-33 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-34 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-35 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-36 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-37 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-38 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-39 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-40 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-41 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-42 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-43 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-44 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-45 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-46 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-47 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-48 爸爸媽媽去哪裡了](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-49 媽媽在廚房煮飯](https://www.youtube.com/watch?v=6t-o-v-o-o-o)
[空中族語教室-12卑南族南王卑南語-03句型結構篇-50 我要讀書](https://www.youtube.com/watch?v=6t-o-v-o-o-o)


### 卑南族傳統生態知識與環境保護

# 卑南族傳統生態知識與環境保護

## 前言

卑南族（Pinuyumayan）作為臺灣原住民族群之一，長期以來與自然環境和諧共存，發展出獨特的傳統生態知識（Traditional Ecological Knowledge, TEK）。這些知識不僅是其文化的重要組成部分，更蘊含著對環境永續利用的智慧。本研究旨在深入探討卑南族在傳統農業、森林管理、水資源利用、氣候物候觀察等方面的傳統生態知識，並分析其在現代環境保護中的應用潛力，以及對臺東縣生態保育的貢獻。



---

## FormosanBank/ePark 卑南語四方言與對應語音（2026-06 擴充）

本技能包已加入 `data/formosanbank_sources.json` 作為 FormosanBank/ePark 卑南語匯入白名單，並以 `data/audio_manifest_schema.json` 定義平台可用的音檔索引格式。

| code | FormosanBank dialect | 中文 | 平台 key |
|---|---|---|---|
| 38 | Nanwang_Puyuma | 南王卑南語 | `puyuma` |
| 39 | Zhiben_Puyuma | 知本卑南語 | `katratripulr` |
| 40 | Xiqun_Puyuma | 西群卑南語 | `ulivelivek` |
| 41 | Jianhe_Puyuma | 建和卑南語 | `kasavakan` |

### 匯入順序

1. 用 `scripts/sync_formosanbank_puyuma.py` 下載 `data/formosanbank_sources.json` 內的 CSV/XML 候選來源。
2. 如有權限，用同一腳本同步 Google Drive folder `1o_iEc2dbet-cENHLjv86R_b67M0TlakZ`。
3. 用 `scripts/build_puyuma_audio_manifest.py` 產生 `data/generated/puyuma_audio_manifest.json`。
4. 用 `scripts/validate_audio_manifest.py` 驗證 `dialect_code`、音檔 URL、重複資料與必要欄位。
5. 網站部署時把音檔上傳到 R2/CDN，前台播放 CDN URL，後台保留原始來源 URL。

### 已內建 seed

`data/generated/puyuma_audio_seed.json` 內含南王、知本、西群、建和少量可測試例句與 MP3 URL，可用於前端播放器、TTS/音檔切換 UI、後台匯入流程的最小測試。
