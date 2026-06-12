# v41 TTS/STT 訓練治理

v41 加入 TTS/STT 訓練管線，但目前仍是候選資料治理，不宣稱模型已完成。

原則：
- 只能使用已授權、可追溯、經審核的真人音檔。
- YouTube 音訊、未授權歌曲、古調與祭儀限制內容不得進入訓練集。
- 公開合成 TTS 預設關閉。
- STT 不提供完整歌曲或古調歌詞轉寫。
- train/dev/test 分割前必須通過授權、逐句對齊、方言標籤、speaker 標籤、敏感內容審核。

VPS 執行：

```bash
./deploy/vps-music-tts-stt-v41.sh
```
