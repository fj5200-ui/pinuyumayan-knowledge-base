# Next upgrade plan v56

{
  "version": "v56",
  "generated_at": "2026-06-13T15:00:00+08:00",
  "items": [
    {
      "priority": 1,
      "direction": "實機證書與備份證據入庫",
      "content": "把 v55 release certificate 實簽後的 PDF/JSON、Cloudflare/DNS、backup restore、rollback、30 分鐘觀測證據寫入不可變資料表。"
    },
    {
      "priority": 2,
      "direction": "首批合法語音真實匯出",
      "content": "在真實 evidence 通過後，輸出第一版 train/dev/test、blocked report、dataset manifest 與 model card。"
    },
    {
      "priority": 3,
      "direction": "搜尋 100% 切換後監控",
      "content": "切到 100% 後建立 24/72 小時監控，若 zero-result 或 p95 異常立即 rollback。"
    },
    {
      "priority": 4,
      "direction": "metadata 正式公開與撤稿紀錄",
      "content": "把通過 rights review 的 metadata-only 卡片正式公開，完成 sitemap/OG ping 與 takedown rehearsal 證據保存。"
    },
    {
      "priority": 5,
      "direction": "治理中心下載與審計",
      "content": "讓水印 PDF、lineage DAG、版本差異與簽核章可在後台下載、查詢與審計。"
    },
    {
      "priority": 6,
      "direction": "營運 SOP 週期化",
      "content": "把每日/每週報告、告警通知、錯誤率、CWV、Lighthouse、OG、sitemap 檢查變成固定營運節奏。"
    }
  ]
}
