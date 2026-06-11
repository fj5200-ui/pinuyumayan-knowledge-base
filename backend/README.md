# Backend API

Express + tRPC + Drizzle ORM backend for 卑南族文化綜合平台資料庫。

## Modules

- `sources`: 來源登錄與授權狀態
- `facts`: 可追溯公開 facts
- `communities`: 卑南族十社
- `rituals`: 祭儀公開摘要與敏感度
- `vocabulary`: 卑南語四方言語料、音檔、IPA、G2P
- `audio`: 音檔 URL 與鏡像佇列
- `review`: 後台審核任務
- `imports`: FormosanBank/ePark 匯入監控
- `search`: 搜尋文件

## 開發

```bash
npm install
npm run dev
```

安全預設：TTS 不可公開、自動音檔鏡像關閉、只回傳 approved/public view。
