# v45 Music Search Quality

v45 在既有 `/api/public/search/music/v43` MySQL FULLTEXT 查詢上增加品質層：

- synonym / romanization query expansion
- weighted ranking contract
- facet count output
- zero-result suggestions
- static quality suite

## 安全限制

搜尋結果仍只公開 metadata。未審核候選不提供完整歌詞、不提供音訊下載、不使用 YouTube 或其他未授權音源作訓練。

## 產物

- `data/search/music_query_synonyms_v45.json`
- `data/search/music_search_quality_v45.json`
- `data/search/music_search_quality_report_v45.generated.json`
- `database/seeds/041_music_search_quality_v45.generated.sql`
