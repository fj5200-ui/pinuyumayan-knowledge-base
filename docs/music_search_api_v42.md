# v42 音樂搜尋 API

新增 `/api/public/search/music`，支援未來 MySQL FULLTEXT / Meilisearch adapter。

Facet：artist、community、work_type、rights_status、sensitivity、source_authority、youtube_official_status。

禁止關聯詞仍會被阻擋：卑南文化遺址、卑南遺址、Peinan Site、Beinan Site。
