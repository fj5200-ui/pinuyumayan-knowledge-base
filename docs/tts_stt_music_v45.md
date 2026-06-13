# v45 TTS/STT + Music Production Governance

本版把 v44 的授權、TTS/STT、音樂 metadata 與權威來源候選升級成可部署的正式治理層。

## 完成項目

1. Speech review workflow：80 筆 preview assets 全部有 formal decision state、gate status 與 append-only audit log contract。
2. Internal write routes：review decision、alignment import、authority fetch report 都放在 `/api/internal/*`，延續 HMAC enforcement。
3. TTS/STT governance：alignment import schema、speaker split leakage check、MOS/WER/CER threshold、model card release review。
4. Public release gate：目前 public TTS/STT、音訊下載與完整歌詞仍全部關閉。

## VPS 操作

```bash
IMPORT_SQL=1 DATABASE_URL="$DATABASE_URL" ./deploy/vps-tts-stt-v45.sh
```

不匯入 SQL 時可先執行 dry-run：

```bash
./deploy/vps-tts-stt-v45.sh
```
