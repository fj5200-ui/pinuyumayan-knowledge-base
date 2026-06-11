# 網站應用：卑南語語詞／句型音檔資料層

## 目標

把知識包中的卑南語資料轉成網站可直接使用的資料表，支援：

- 前台語詞／句型列表
- 方言篩選：南王、知本、西群、建和
- 主題篩選：問候語、教室與學校、家庭與部落、日常會話
- 音檔播放
- 單筆語音學習頁
- 後台審核與來源追溯

## 核心檔案

- `data/web/puyuma_vocabulary_audio_entries.json`
- `data/web/puyuma_vocabulary_categories.json`
- `data/web/puyuma_vocabulary_api_contract.json`
- `data/web/puyuma_vocabulary_seed.sql`
- `webapp/components/PuyumaAudioCard.tsx`
- `webapp/components/PuyumaVocabularyBrowser.tsx`
- `webapp/drizzle/puyuma_vocabulary.schema.ts`

## 音檔規則

目前 ZIP 只保存音檔 URL，不保存 MP3 本體。前端以遠端串流方式播放，避免授權與檔案容量問題。

禁止 AI 自行編造音檔 URL。只有資料中 `audio.url` 存在且來源為 `formosanbank_epark` 的項目，才能顯示播放器。

## 發佈規則

1. 每筆資料必須有 `source.source_path`。
2. 每筆資料必須有 `audio.url`。
3. 每筆資料必須標記 `review_status`。
4. 商業使用或搬移音檔前，需要做授權檢查。
5. 祭儀、巫師、祖靈等敏感內容不得混入語音學習資料，除非來源為公開教材且僅作語句學習。
