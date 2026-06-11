# Export Bundle v11

匯出 bundle 用於主站預熱快取、建立靜態資料快照、降低 API 熱點查詢壓力。

## Bundle types

- `main_site_bootstrap`
- `vocabulary_audio`
- `search_documents`
- `full_public_snapshot`

## 必備欄位

每個 artifact 必須記錄：

- `artifact_key`
- `sha256`
- `size_bytes`
- `row_count`
- `bundle_type`
- `generated_at`
- `source_release_channel`

## 安全規則

匯出只能讀 public-safe view，不能從 raw tables 直接 dump。
