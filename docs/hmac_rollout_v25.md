# v25 HMAC / nonce 落地方案

Internal API 需帶：

- `x-pinuyumayan-main-site-key`
- `x-pinuyumayan-client-id`
- `x-pinuyumayan-timestamp`
- `x-pinuyumayan-nonce`
- `x-pinuyumayan-signature`

簽章基底：

```txt
METHOD
PATH_WITH_QUERY
TIMESTAMP
NONCE
SHA256_BODY
```

正式環境應逐步從 observe → shadow_block → enforce。
