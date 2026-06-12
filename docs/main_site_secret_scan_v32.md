# v32 主站 secret scan

主站搬移 v23-v32 檔案後，必須掃描 server-only secret 是否誤放到 client component。

```bash
./deploy/main-site-secret-scan-v32.sh ../main-site
```

不得出現在瀏覽器端的變數：`OPENAI_API_KEY`、`KIMI_API_KEY`、`PINUYUMAYAN_HMAC_SECRET`、`PINUYUMAYAN_MAIN_SITE_API_KEY`。
