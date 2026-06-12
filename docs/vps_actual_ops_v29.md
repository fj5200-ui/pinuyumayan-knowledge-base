# v29 VPS Actual Ops：實際執行層

v29 的目標是把 v28 的流程變成可在你的 VPS staging 上執行的指令與 DB-backed API。

## 一、先檢查 VPS 環境

```bash
python3 scripts/verify_vps_env_v29.py --database "$DATABASE_URL" --mode staging
```

## 二、先備份

```bash
./deploy/vps-db-backup-v26.sh
```

## 三、跑千筆語料

```bash
./deploy/vps-run-full-corpus-v29.sh \
  --min-entries 1000 \
  --database "$DATABASE_URL" \
  --import-sql
```

這會產出：

```txt
data/database/full_corpus_acceptance_report_v29.generated.json
```

如果低於 1000 筆，必須失敗；不能推進 public release。

## 四、建立搜尋索引

```bash
python3 scripts/build_search_index_population_v29.py --database "$DATABASE_URL"
```

這會產生並可匯入 `data/search/search_population_v29.generated.sql`。

## 五、備份還原 checksum 演練

```bash
./deploy/vps-backup-restore-checksum-v29.sh \
  --backup /var/backups/pinuyumayan/latest.sql.gz \
  --target-db pinuyumayan_kb_restore
```

不可還原覆蓋 production DB。

## 六、禁止關聯規則

卑南文化遺址、卑南遺址、Beinan Site、Peinan Site 只能作為 negative disambiguation，不可作為卑南族文化來源、AI source packet、搜尋同義詞或 related content。
