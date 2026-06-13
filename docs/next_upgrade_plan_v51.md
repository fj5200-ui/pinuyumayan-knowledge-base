# 下一次完善＆開發＆升級＆優化方案：v51

| 優先 | 方向 | 內容 |
|---:|---|---|
| 1 | 實機切換封板 | 在 VPS staging/production 跑完 v50 blue-green 或 rolling cutover rehearsal，產生 health、DNS、rollback、備份還原完整證據報告。 |
| 2 | 審核證據鏈實物上傳 | 把 license、speaker consent、alignment evidence 實際附件上傳到 evidence store，完成防竄改 hash chain、掃描、逐筆簽核。 |
| 3 | 搜尋 A/B 實測 | 把 v50 learning-to-rank 與 typo tolerance 用 10% 流量測試，建立 query intent dashboard、人工審核 synonym 合併流程。 |
| 4 | 權威 metadata 上架 | 完成 rights review 後，將 metadata-only 候選發布到主站卡片與搜尋索引，附 citation、異動通知與撤稿鈕。 |
| 5 | 模型治理正式交付 | 在 VPS 安裝 PDF renderer，輸出帶水印模型治理 PDF、簽核章、lineage graph 與版本差異報告。 |
| 6 | 品牌驗收與效能實測 | 用瀏覽器截圖與 Lighthouse/CWV 驗證首頁、文化、族語、音樂、地圖、TTS/STT 頁，修正剩餘對比與效能問題。 |
