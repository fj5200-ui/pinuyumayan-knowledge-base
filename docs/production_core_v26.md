# v26 Production Core Implementation

v26 從「規格骨架」往「正式核心實作」推進：

- 後台登入改為 DB-backed route，不再只有 placeholder。
- Internal API 新增 v26 HMAC + nonce 驗證，nonce 寫入 `internal_api_nonces_v26`。
- 文章審核 action 寫入 `article_review_transactions_v26` 與 `article_review_audit_v26`。
- 資料庫部署目標明確改為使用者 VPS。
- 繼續保留：文章由主站 server-side AI route 生成，後端知識庫只做史料、引用、去重、安全、審核與發布治理。
- 繼續保留：卑南文化遺址 / Beinan Site / Peinan Site 不得作為卑南族文化知識來源。

下一版 v27 應優先做：實際 full corpus 匯入、後台 UI 串 v26 API、Production DB fallback 關閉策略、全文搜尋索引。
