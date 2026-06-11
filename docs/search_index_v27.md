# v27 搜尋索引策略

VPS DB 預設先使用 MySQL/MariaDB FULLTEXT。

索引表：

```txt
search_index_documents_v27
search_zero_result_logs_v27
search_rebuild_runs_v27
```

禁止關聯規則仍然有效：

```txt
卑南文化遺址 / 卑南遺址 / Beinan Site / Peinan Site / Peinan Archaeological Site
```

這些詞不得進入卑南族文化 related content 或 AI source packet，只能作為 negative disambiguation。
