# 後台需求

## Dashboard

- facts 數量與待審核數
- 十社資料完整性
- 祭儀敏感內容待審核
- preview/full corpus 匯入狀態
- 音檔授權與鏡像狀態
- IPA/G2P/TTS 待審核數

## 審核工作台

每筆審核任務至少包含：

- entity_type / entity_id
- task_type
- priority
- assigned_role
- source_ids
- before/after payload
- approve/reject/archive 操作

## 權限

- owner：全權限
- culture_reviewer：文化 facts / rituals 審核
- language_reviewer：語詞、IPA、G2P、TTS 審核
- audio_manager：音檔授權與鏡像
- import_operator：語料匯入與索引重建
- viewer：唯讀
