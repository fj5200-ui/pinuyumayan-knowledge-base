# v43 下一次完善＆開發＆升級＆優化方案

1. VPS 真實授權審核：把 80 筆 preview candidates 補 license、speaker consent、alignment，產生可訓練/不可訓練清單。
2. STT/TTS 模型實驗區：建立 local training workspace，但預設不公開模型。
3. 音樂搜尋 live DB：`/api/public/search/music` 改讀 MySQL FULLTEXT 真表。
4. 權威來源實抓：臺灣音樂館、國家文化記憶庫、金曲獎資料 metadata 寫入候選表。
5. 後台評估 UI：MOS/WER/CER、dataset split、授權審核、模型 release gate 視覺化。
6. 主站整合：歌謠/歌曲 metadata 頁、音樂搜尋頁、TTS/STT 說明頁，不顯示未授權音源或完整歌詞。
