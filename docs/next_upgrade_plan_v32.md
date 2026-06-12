# v32 下一次完善＆開發＆升級＆優化方案

## 最高優先

1. 在 VPS staging 實跑 v31 dry-run，回填報告。
2. 主站實際搬移 routes/lib/components，完成 secret scan。
3. HMAC middleware 包住所有 `/api/internal/*`。
4. VPS staging 實跑 full corpus，產生真正 >=1000 或失敗報告。
5. 後台 dashboard 串 live API。

## 注意事項

- 不要把 80 筆 preview 語料講成千筆。
- 不要讓後端知識庫生成文章正文。
- 不要把卑南文化遺址 / Beinan Site 當成卑南族文化來源。
- Production DB 掛掉不可靜默 fallback 到 static JSON。
