{
  "version": "v35",
  "generated_at": "2026-06-12T00:00:00+08:00",
  "title_zh": "下一次完善＆開發＆升級＆優化方案：v35",
  "priorities": [
    {
      "priority": 1,
      "direction": "來源擷取 Worker 真實實作",
      "tasks": [
        "實作 TIPP/族語詞典/文化記憶庫候選 fetch adapter",
        "寫入 VPS DB candidate tables",
        "不自動公開"
      ]
    },
    {
      "priority": 2,
      "direction": "候選審核 UI",
      "tasks": [
        "顯示來源 URL、授權、claim 候選、禁止關聯結果",
        "approve 後才轉 public summary"
      ]
    },
    {
      "priority": 3,
      "direction": "MySQL FULLTEXT 寫入",
      "tasks": [
        "將 v34 public_search_documents 寫入 search_index_documents_v27",
        "支援十社/羅馬拼寫/族語詞查詢"
      ]
    },
    {
      "priority": 4,
      "direction": "AI Composer 引用檢查",
      "tasks": [
        "前端草稿必須帶 claim_ids/source_ids",
        "阻擋未引用史料與高重複文章"
      ]
    },
    {
      "priority": 5,
      "direction": "VPS 千筆語料",
      "tasks": [
        "在 VPS staging 實跑 full corpus pipeline",
        "回填 acceptance report",
        "音檔/PHON/授權覆蓋率儀表板"
      ]
    },
    {
      "priority": 6,
      "direction": "內容安全",
      "tasks": [
        "繼續阻擋卑南文化遺址關聯",
        "祭儀/巫術/祖靈內容只允許公開摘要"
      ]
    }
  ]
}