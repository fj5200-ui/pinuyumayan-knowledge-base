# v24 HMAC + Nonce Internal API 安全

所有主站 server → 知識庫 internal API 的請求都要帶：

```txt
x-pinuyumayan-main-site-key
x-pinuyumayan-client-id
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

正式環境建議：

- nonce TTL 300 秒。
- timestamp 允許誤差 300 秒。
- nonce 用過即拒絕。
- 失敗寫入 `internal_hmac_nonce_failures_v24`。
- 每 90 天輪替 API key 與 HMAC secret。
