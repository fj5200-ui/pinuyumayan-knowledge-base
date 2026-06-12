# v42 TTS/STT 評估與音樂搜尋

v42 把 v41 的 TTS/STT 管線往「授權審核、資料切分、評估報告、音樂搜尋 API」推進。

## 原則

- 不下載 YouTube 音訊或影片。
- 不保存完整歌詞。
- 不使用未授權歌曲或影片音軌訓練 TTS/STT。
- train_ready_items 可以是 0，這代表授權審核尚未通過，而不是失敗。
- 公開 TTS/STT 必須先通過 license、consent、alignment、MOS/WER/CER 與人工審核。

## VPS 執行

```bash
./deploy/vps-tts-stt-v42.sh
```

若要匯入 DB：

```bash
IMPORT_SQL=1 DATABASE_URL="$DATABASE_URL" ./deploy/vps-tts-stt-v42.sh
```
