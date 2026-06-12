# v33 擴大搜尋與知識庫內容擴充

v33 將「擴大搜尋」拆成兩層：

1. **Verified public summary**：只採用已可追溯的官方公開來源，產生 public cards / search documents / source packets。
2. **Candidate intake**：TIPP、國家文化記憶庫、族語詞典、臺東地方來源、學術 metadata 先進候選區，不自動公開。

## 不重複規則

- 所有 claim 使用 `canonical_fingerprint` 去重。
- source packet 使用 claim id 集合去重。
- 同 claim set 不重複給 AI Composer 發文。
- 卑南文化遺址 / Beinan Site / Peinan Site 只允許 negative disambiguation，不得放入卑南族文化 knowledge card 或 AI source packet。

## 主站使用

主站前端可讀：

- `/api/public/true-knowledge/v33/cards`
- `/api/public/true-knowledge/v33/search-documents`
- `/api/public/ai-article/v33/source-packets`

主站後台/內部可回填：

- `/api/internal/source-search/v33/ingestion-report`
- `/api/internal/ai-article/v33/source-grounding-check`
