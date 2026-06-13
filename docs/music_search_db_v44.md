# v44 Music Search MySQL FULLTEXT

`/api/public/search/music/v43` 已升級為 VPS MySQL FULLTEXT 優先。

資料表：`music_search_documents_v43`

FULLTEXT 欄位：`title, artist, community, work_type, summary, source_title, romanized_terms, body`

Public gate：

- `public_visible = 1`
- `review_status IN ('approved_public', 'metadata_public', 'candidate_summary_public')`
- forbidden relation terms blocked
- 不回傳完整歌詞、不提供音訊下載欄位

支援 query params：

- `q`
- `limit`
- `artist`
- `community`
- `work_type`
- `rights_status`
- `sensitivity`
- `source_authority`
- `youtube_official_status`
