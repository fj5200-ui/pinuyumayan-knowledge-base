# 真實資料擴充與來源查核規範

本技能包的卑南族內容採「來源可追溯」原則。所有可公開生成的資料必須符合下列規則：

## 一、來源分級

1. **official_primary_public**：政府機關、官方族群介紹、官方統計、公開法規或公告。可作公開頁面的主要依據。
2. **open_research_data**：公開研究資料庫、開放語料、可驗證的 GitHub/資料集。可用於族語、語音、教材、索引與研究輔助。
3. **academic_or_museum_reference**：博物館、學術出版、學位論文、研究報告。可補充歷史與物質文化，但需註明研究脈絡。
4. **community_reviewed**：已由部落、族人、文化工作者或授權單位審核的內容。可公開使用。
5. **oral_or_unverified**：口述、社群貼文、未註明來源文章、二手轉述。不可寫成定論，只可進入待審區。

## 二、AI 生成限制

- 不可把「Puyuma」直接當作整個卑南族族稱；整體族群使用「卑南族 / Pinuyumayan」。
- 不可把「八社」作為現行正式分類；只可作為歷史稱謂說明。
- 不可編造祭儀時間、禁忌、歌詞、家族來源、巫師知識、神靈故事。
- 不可替部落發布未經公告的祭典日期。
- 不可把敏感祭儀細節、家族譜系、祖靈屋配置、巫術程序做成公開教學。
- 遇到來源不一致，應輸出「目前資料來源不一致，需部落複核」，不可自行合併成定論。

## 三、資料欄位要求

每筆資料至少包含：

```json
{
  "id": "stable_key",
  "category": "topic",
  "statement_zh": "可驗證事實摘要",
  "verification_status": "verified_public | community_review_required | restricted | disputed_or_uncertain",
  "sensitivity": "low | medium | high",
  "source_ids": ["cip_puyuma_profile"]
}
```

## 四、平台公開規則

- 首頁、部落頁、公開 CMS：只使用 `verified_public` 或 `community_reviewed`。
- 祭儀、巫師、祖靈、家族制度：即使有公開來源，也預設 `public_summary_only`，不得展開成儀式操作步驟。
- 族語/語音：可用 FormosanBank/ePark 公開語料與音檔 URL，但必須保留來源與原檔路徑。
- 人物資料：必須分開「已公開人物介紹」與「部落內部角色」，不得推測私人身分。
