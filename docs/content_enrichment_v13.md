# v13 內容豐富與主站內容拉取

v13 新增 `data/content/main_site_content_packets_v13.json`，將既有 verified facts、十社資料、祭儀公開摘要與主題頁整理成主站可拉取的內容包。

## 原則

- 不新增未查證文化事實。
- 每個 content packet 都必須有 `source_ids`。
- 祭儀、祖靈、巫師、家族與禁忌相關內容預設只提供 `public_summary_only`。
- 發佈前需經過 human review 與 release channel quality gate。

## 主站拉取

- `GET /api/public/content/collections`
- `GET /api/public/content/items/:slug`
- `POST /api/internal/content/rebuild-collections`

## 匯入資料庫

```bash
python3 scripts/build_content_seed_sql.py
mysql "$DATABASE_URL" < database/seeds/010_content_collections_seed.sql
mysql "$DATABASE_URL" < database/seeds/011_content_items.generated.sql
```
