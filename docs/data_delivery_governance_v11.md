# v11 Data Delivery Governance

v11 將後端資料庫服務補成主站可長期拉取的資料交付層，重點不是新增未查證文化內容，而是完善 API 版本、scope、匯出、同步回放、資料品質與失敗重試。

## 核心原則

- Public API 只回傳 public-safe view。
- Internal API 必須同時驗證 API key 與 scope。
- `preview_subset = 80` 與 `full_corpus >= 1000` 必須永遠分開標示。
- 匯出 bundle 必須有 manifest、row count、sha256。
- 主站錯過 webhook/delta 時，使用 sync replay 重建變更序列。
- full corpus import 失敗必須進 retry policy 或 dead letter，不可靜默失敗。

## 新增能力

1. `/api/public/version` 回傳 API 版本與資料範圍。
2. `/api/public/knowledge/export/latest` 提供主站最新 public-safe 匯出資訊。
3. `/api/internal/exports/bundle/enqueue` 產生匯出 bundle。
4. `/api/internal/main-site/sync/replay` 讓主站回放指定區間的變更。
5. `database/migrations/0007_data_delivery_governance.sql` 建立版本、scope、匯出、同步、品質報表與 dead-letter 表。

## 給 Codex/Kimi 的實作要求

- 先實作 SQL migration。
- 再補 DB repository 層與真正查詢。
- REST skeleton 已提供，需接上資料庫。
- OpenAPI 已加入路徑，實作時不可改 response shape。
- 所有匯出與 replay 都要寫入 audit log。
