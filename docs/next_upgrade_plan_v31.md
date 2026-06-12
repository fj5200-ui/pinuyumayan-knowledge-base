# v31 下一次完善＆開發＆升級＆優化方案

1. 在 VPS staging 跑 v30 cutover dry-run，產生 readiness report。
2. 把 v25～v30 webapp routes/components 真正搬到主站。
3. 全面強制 HMAC + nonce 到所有 internal API。
4. 在 VPS staging 實跑千筆語料，回填 acceptance report。
5. 後台 dashboard 真串：登入、審核、HMAC failures、full corpus runs、search quality。
6. 多來源候選實抓，但不自動公開。
7. 搜尋品質調整與 zero-result workflow。
