# 部署時安裝與資料匯入指南 v7

本專案部署時分成兩個層次：

1. **後端服務安裝**：Node.js dependencies、TypeScript build、Express/tRPC API 啟動。
2. **資料庫初始化與語料匯入**：migrations、核心 seed、preview 語料、千筆級 full corpus post-deploy job。

## 建議部署模式

### 模式 A：快速上線 preview mode

適合第一次部署、測試 VPS、確認主站能拉知識。

```bash
unzip pinuyumayan-backend-database-main-site-api-v7.zip
cd pinuyumayan-backend-database
cp .env.example .env
cp backend/.env.example backend/.env
# 編輯 DATABASE_URL / MAIN_SITE_API_KEY

DEPLOY_INSTALL_MODE=preview ./deploy/install.sh
APPLY_DATABASE_BOOTSTRAP=true ./deploy/install.sh
```

這會安裝後端並可選擇匯入：

- database migrations
- sources / communities / facts / rituals
- 80 筆 preview vocabulary audio
- main-site API client seed

### 模式 B：正式站 post-deploy 匯入千筆語料

建議正式上線使用。先讓 API 可用，再跑完整語料匯入。

```bash
DEPLOY_INSTALL_MODE=preview APPLY_DATABASE_BOOTSTRAP=true ./deploy/install.sh
cd backend && npm run start
```

健康檢查通過後：

```bash
FULL_CORPUS_MIN_ENTRIES=1000 IMPORT_SQL_AFTER_BUILD=true ./deploy/postdeploy-full-corpus.sh
```

這會從 FormosanBank/ePark 來源建置千筆級卑南語語料，保留音檔 URL、source PHON、G2P/IPA/TTS metadata，並產生 SQL seed。

### 模式 C：blocking full corpus

只適合維護時間或一次性初始化；匯入未達 1000 筆會阻擋部署。

```bash
DEPLOY_INSTALL_MODE=full-corpus-blocking RUN_FULL_CORPUS_ON_DEPLOY=true ./deploy/install.sh
```

## 為什麼不建議在 `npm start` 裡匯入千筆語料

- FormosanBank/ePark 來源下載與 XML/CSV 解析可能耗時。
- 大量 SQL insert 會拖慢啟動。
- 主站 health check 可能逾時。
- 若外部 GitHub/音檔來源暫時不可用，會讓 API 無法啟動。

所以千筆語料應放在 **post-deploy job** 或後台匯入任務。

## VPS systemd 範例

```bash
sudo cp deploy/systemd/pinuyumayan-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable pinuyumayan-backend
sudo systemctl start pinuyumayan-backend
sudo systemctl status pinuyumayan-backend
```

## Nginx reverse proxy

參考：

```txt
deploy/nginx/pinuyumayan-backend.conf.example
```

## 主站拉取資料

部署完成後，主站讀：

```txt
GET /api/public/knowledge/bootstrap
GET /api/public/knowledge/search?q=...
GET /api/public/knowledge/related?entityType=...&entityId=...
GET /api/public/knowledge/vocabulary?dialectCode=39&limit=50
```

主站後端同步讀：

```txt
GET /api/internal/main-site/knowledge/bundle
GET /api/internal/main-site/knowledge/delta?since=...
```

需帶：

```txt
x-pinuyumayan-main-site-key: <MAIN_SITE_API_KEY>
```

## 驗收

```bash
python3 scripts/validate_deployment_install_layer.py
python3 scripts/validate_backend_database_project.py
python3 scripts/validate_main_site_api_layer.py
python3 scripts/validate_full_corpus_pipeline.py
./deploy/healthcheck.sh
```
