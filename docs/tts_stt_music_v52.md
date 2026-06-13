# Pinuyumayan TTS/STT Music v52

v52 將 v51 的封板合約推進到可在 VPS 上執行的操作包：實機 go-live、30 分鐘觀測、證據鏈開通、搜尋 A/B 收斂、權威 metadata 發布、模型治理簽核與正式品牌效能監控。

## 安全狀態

- 80 筆 preview speech assets 仍維持 blocked。
- 沒有公開音訊、沒有公開完整歌詞、沒有允許未授權模型訓練。
- 沒有真實 VPS/DNS/Cloudflare 證據前，release_allowed 一律為 false。

## VPS 指令

```bash
./deploy/vps-tts-stt-v52.sh
IMPORT_SQL=1 DATABASE_URL="$DATABASE_URL" ./deploy/vps-tts-stt-v52.sh
RUN_GO_LIVE_EXECUTION=1 DATABASE_URL="$DATABASE_URL" ./deploy/vps-tts-stt-v52.sh
```
