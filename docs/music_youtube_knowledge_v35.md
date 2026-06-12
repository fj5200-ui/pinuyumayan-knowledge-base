# v35 卑南族歌謠／古調／歌曲／YouTube 來源候選擴充

本版將歌謠、古調、現代歌曲與 YouTube 來源納入知識庫候選流程。

## 原則

- 只保存 metadata、來源 URL、頻道、審核狀態。
- 不保存完整歌詞。
- 不下載、不代理、不重製 YouTube 音訊或影片。
- 祭儀、祖靈、巫師、除喪相關歌謠只允許公開摘要。
- 卑南文化遺址／Beinan Site／Peinan Site 不得作為卑南族歌謠來源。

## 主站使用方式

主站可呼叫：

```txt
GET /api/public/true-knowledge/v35/music/cards
GET /api/public/true-knowledge/v35/music/search-documents
GET /api/public/ai-article/v35/music-source-packets
```

YouTube 擷取結果必須走後台審核：

```txt
GET /api/ops/music-youtube/v35/review-queue
POST /api/internal/music-youtube/v35/ingestion-report
POST /api/internal/music-youtube/v35/review-report
```
