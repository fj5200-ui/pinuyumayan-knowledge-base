# 主站卑南語發音播放器整合 v17

主站可直接使用：

```ts
import { createPuyumaPronunciationClient } from "./frontend-sdk/puyumaPronunciationClient.v17";

const client = createPuyumaPronunciationClient({
  baseUrl: process.env.NEXT_PUBLIC_KB_API_URL!,
  preferProxy: false
});

const items = await client.search({ q: "老師", dialectCode: "38", limit: 10 });
```

React 元件範例：

```tsx
<PuyumaPronunciationPlayer
  baseUrl={process.env.NEXT_PUBLIC_KB_API_URL!}
  assetId="pron-a93b397f4a7a5a9b"
/>
```

播放 fallback：

```txt
sourceAudioUrl → proxyUrl → 顯示「目前沒有可公開播放真人音檔」
```

禁止 fallback 到未審核合成 TTS。
