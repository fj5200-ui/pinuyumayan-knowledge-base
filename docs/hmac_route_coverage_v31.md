# v31 HMAC Route Coverage

所有 `/api/internal/*` 都應強制簽章：

```txt
METHOD
PATH_WITH_QUERY
TIMESTAMP
NONCE
SHA256_BODY
```

必帶 headers：

```txt
x-pinuyumayan-main-site-key
x-pinuyumayan-client-id
x-pinuyumayan-timestamp
x-pinuyumayan-nonce
x-pinuyumayan-signature
```

Nonce 必須存 DB 或 Redis。重複 nonce 一律拒絕並寫入 security audit log。
