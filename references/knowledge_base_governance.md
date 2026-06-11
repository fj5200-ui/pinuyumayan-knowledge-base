# 卑南族文化綜合平台知識庫治理規範

本文件規定 `pinuyumayan-expert` 知識包的擴充、審核、發佈與 AI 使用方式。目標是確保資料真實、來源可追溯、敏感內容不被 AI 誤用。

## 1. 資料等級

| 等級 | 說明 | 可用方式 |
|---|---|---|
| `verified_public` | 已有公開來源支持 | 可公開摘要或內容卡 |
| `community_review_required` | 公開來源不足或涉及部落內部脈絡 | 僅作草稿，不公開 |
| `restricted` | 可能涉及禁忌、家族、祖靈、巫師、祭儀操作 | 不公開；只保留索引或審核提醒 |
| `disputed_or_uncertain` | 來源矛盾或仍需查證 | 只能寫「待查證」 |

## 2. AI 使用順序

1. 先讀 `SKILL.md` 的核心規則。
2. 依 `data/knowledge_base_index.json` 判斷任務路由。
3. 文化事實優先讀 `data/verified_pinuyumayan_facts.json`。
4. 名稱與十社一律以 `references/tribe_name_authority.md` 為最高優先。
5. 涉及祭儀、祖靈、巫師、親屬、會所與年齡階級時，必須套用 `summary_only`。
6. 族語音檔只能依 `data/audio_manifest_schema.json` 與 manifest，禁止猜測 URL。

## 3. 發佈限制

- 高敏感內容不得自動上架。
- 祭儀日期不得由 AI 推測，必須查部落或官方公告。
- 人物傳記、作品、得獎紀錄須另查個別來源。
- 「八社」只能作歷史用語，平台分類固定為「卑南族十社」。
- `Puyuma` 不可直接代稱整個卑南族。

## 4. 最低驗收指令

```bash
python3 scripts/validate_knowledge_base.py
python3 scripts/validate_verified_facts.py
python3 scripts/validate_content_data.py
python3 scripts/validate_audio_manifest.py data/generated/puyuma_audio_seed.json
python3 scripts/validate_package.py
python3 -m py_compile scripts/*.py
```
