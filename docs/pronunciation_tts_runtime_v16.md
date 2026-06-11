# v16 Pronunciation-first TTS Runtime

本專案的卑南語 TTS 不應該用「假合成音」冒充真實族語發音。v16 採用 pronunciation-first 架構：

1. 有 FormosanBank/ePark 真人音檔時，公開端直接播放來源音檔。
2. 來源 XML 有 `<PHON>` 時，保留為 `source_phon`；沒有時才用 G2P/IPA 草稿輔助檢索。
3. 沒有真人音檔的文字，不直接公開神經 TTS。
4. 神經 TTS 必須先取得授權音檔、文本對齊、方言標籤、教師/族人審核，才能進 public channel。

## Public endpoints

```txt
GET /api/public/pronunciation/:entryId
GET /api/public/tts/pronounce?entryId=...&dialectCode=...
GET /api/public/tts/pronounce?text=...&dialectCode=...
```

`/api/public/tts/pronounce` 的 public 行為：

- 找到完全或部分匹配：回傳真人來源音檔。
- 找不到來源音檔：回傳 `rejected_no_verified_audio`，不公開產生假 TTS。

## Internal endpoints

```txt
GET  /api/admin/tts/models
POST /api/internal/tts/synthesize
```

`POST /api/internal/tts/synthesize` 可以排入後台審核或未來的 TTS 訓練/推論佇列，但預設不會生成 public 音檔。

## 真正像音檔的 TTS 需要什麼

若要支援任意文字也能像來源音檔一樣自然，需要：

- 每個方言至少 2 小時授權音檔，建議 10 小時以上。
- 每筆音檔對應正確卑南語文本。
- 句段切分與 alignment。
- 保存 source PHON / IPA。
- 教師或族人審核。
- 聲音相似度與發音正確率品質門檻。
- 不能用在祭儀、祖靈、巫師、禁忌內容自動生成。

因此 v16 的正確策略是：**公開端先使用真人音檔，TTS 作為未來訓練模型，不把未審核模型公開。**
