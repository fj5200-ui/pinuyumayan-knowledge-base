# VPS 部署 Runbook

## 1. 系統套件

```bash
sudo apt update
sudo apt install -y nodejs npm python3 python3-pip mysql-client nginx unzip
node -v
npm -v
python3 --version
```

Node 建議 20+。若系統預設版本太舊，請改用 NodeSource 或 nvm 安裝 Node 20。

## 2. 上傳與解壓縮

```bash
sudo mkdir -p /opt/pinuyumayan-backend-database
sudo chown -R $USER:$USER /opt/pinuyumayan-backend-database
unzip pinuyumayan-backend-database-main-site-api-v7.zip -d /opt
cd /opt/pinuyumayan-backend-database
```

## 3. 環境變數

```bash
cp .env.example .env
cp backend/.env.example backend/.env
nano backend/.env
```

必要項目：

```txt
DATABASE_URL=mysql://user:password@host:3306/pinuyumayan
MAIN_SITE_API_KEY=<strong-random-secret>
ALLOWED_ORIGINS=https://pinuyumayan.tw,https://www.pinuyumayan.tw
```

## 4. 安裝與初始化

```bash
DEPLOY_INSTALL_MODE=preview APPLY_DATABASE_BOOTSTRAP=true ./deploy/install.sh
```

## 5. 啟動 API

```bash
cd backend
npm run start
```

或用 systemd：

```bash
sudo cp ../deploy/systemd/pinuyumayan-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now pinuyumayan-backend
```

## 6. 千筆語料 post-deploy 匯入

```bash
cd /opt/pinuyumayan-backend-database
FULL_CORPUS_MIN_ENTRIES=1000 IMPORT_SQL_AFTER_BUILD=true ./deploy/postdeploy-full-corpus.sh
```

## 7. 健康檢查

```bash
PUBLIC_KNOWLEDGE_BASE_URL=http://localhost:8787 ./deploy/healthcheck.sh
```
