# v28 VPS Live Ops：千筆語料、搜尋、fallback、備份還原

v28 的目的不是把 80 筆 preview 語料假裝成千筆，而是把 VPS staging 實跑流程補齊。

## VPS staging 跑千筆語料

```bash
./deploy/vps-db-backup-v26.sh
./deploy/vps-full-corpus-staging-v28.sh --min-entries 1000 --database "$DATABASE_URL"
```

產出：

```txt
data/database/full_corpus_acceptance_report_v28.generated.json
```

若總筆數低於 1000，報告必須失敗，不能推進 public release。

## Production fallback

正式環境建議：

```env
NODE_ENV=production
KNOWLEDGE_DATA_MODE=db
DISABLE_PRODUCTION_STATIC_FALLBACK=true
```

正式 DB 掛掉時，不可默默吃 static JSON；必須回錯誤與記錄事件。

## 搜尋索引

```bash
python3 scripts/build_mysql_fulltext_index_v28.py --out data/search/mysql_fulltext_seed_v28.generated.sql
mysql "$DATABASE_URL" < data/search/mysql_fulltext_seed_v28.generated.sql
```

搜尋索引必須套用卑南文化遺址禁止關聯規則。

## 備份還原演練

```bash
./deploy/vps-restore-drill-v28.sh --backup /var/backups/pinuyumayan/latest.sql.gz --target-db pinuyumayan_kb_restore
```

只能還原到 staging/restore DB，不可覆蓋 production DB。
