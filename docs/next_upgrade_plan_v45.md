# 下一次完善＆開發＆升級＆優化方案：v45

| 優先 | 方向 | 內容 |
|---:|---|---|
| 1 | 審核工作流正式化 | 把 v44 license/consent/alignment 審核改成可寫入 DB 的 approve/reject/return 修正流程，加入 reviewer、timestamp、audit log 與 HMAC 內部操作。 |
| 2 | 音樂搜尋品質 | 加入 synonym/romanization 字典、權重排序、facet count、zero-result suggestion 與搜尋品質測試集。 |
| 3 | 權威來源實抓 | 把臺灣音樂館、文化記憶庫、金曲獎 adapter 接成排程 worker，支援 rate limit、去重、重跑與錯誤報告。 |
| 4 | TTS/STT 實驗治理 | 建立 alignment tool 匯入格式、speaker split 防洩漏檢查、MOS/WER/CER 版本比較與模型卡發布審核。 |
| 5 | 主站 SEO/OG | 歌謠/歌曲 metadata 頁加入動態 OG、JSON-LD、sitemap 與 no-lyrics/no-audio-download guard。 |
| 6 | 部署報告中心 | 把 v44 SQL migration、seed、worker dry-run、search smoke test、admin UI contract 納入 VPS preflight。 |
