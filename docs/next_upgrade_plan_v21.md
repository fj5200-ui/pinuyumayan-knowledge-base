# 下一次完善＆開發＆升級＆優化方案：v21

## 1. 多來源真實知識擴充

新增 TIPP、文化部、臺東縣官方資料、博物館與學術來源 adapter。每個來源都必須保存 source_id、URL、擷取時間、授權狀態與 evidence_locator。

## 2. 前端 AI Composer 正式接主站

實作 Next.js 前端頁面：選 source packet、輸入你的想法、呼叫 AI、顯示引用、送審。

## 3. 後台審核 UI

建立 AI 草稿審核列表、引用檢查、重複檢查、敏感內容標籤與發布按鈕。

## 4. 後端知識庫安全實作

把 HMAC signature、nonce、防重放、scope guard、public payload redaction 測試落地。

## 5. 千筆語料匯入實測

實際跑 FormosanBank full corpus downloader，目標產生 >=1000 筆語料，並輸出 audio coverage / PHON coverage / license report。

## 6. 發布排程與冷卻時間

建立 article publish scheduler，避免同主題短時間重複發布。
