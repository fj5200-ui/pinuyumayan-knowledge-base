# v22 後端知識庫安全：HMAC + Nonce

版本：v22  
產生時間：2026-06-11T15:21:47+00:00

Internal API 除 `x-pinuyumayan-main-site-key` 外，建議正式環境啟用：

```txt
x-pinuyumayan-timestamp
x-pinuyumayan-nonce
x-pinuyumayan-signature
```

簽章基底：

```txt
METHOD
PATH_WITH_QUERY
TIMESTAMP
NONCE
SHA256_BODY
```

演算法：HMAC-SHA256。Nonce 預設 10 分鐘內不可重複使用。失敗寫入 `internal_api_signature_audit_v22`。
