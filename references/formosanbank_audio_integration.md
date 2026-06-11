# FormosanBank × 對應語音擴充規格

本檔案定義「卑南族文化綜合平台」如何使用 FormosanBank/ePark 卑南語語料與使用者指定的 Google Drive 對應語音資料夾。

## 1. 來源

- FormosanBank GitHub：`https://github.com/FormosanBank/FormosanBank`
- 鎖定 commit：`604a1074b6ea5685365defd8cfd043f3f10aaecb`
- 主要資料區：`Corpora/ePark/CodeAndDocs/` 與 `Corpora/ePark/XML/`
- 使用者指定對應語音 Google Drive folder：`1o_iEc2dbet-cENHLjv86R_b67M0TlakZ`

> 注意：Google Drive folder 可能需要登入或權限。技能包內不直接附大型音檔，只保留同步腳本、索引格式與 seed manifest。正式部署時應把音檔同步至物件儲存或 CDN，例如 Cloudflare R2。

## 2. 四方言對應

| ePark code | FormosanBank 名稱 | 中文顯示 | 平台 community key | 備註 |
|---|---|---|---|---|
| 38 | Nanwang_Puyuma | 南王卑南語 | `puyuma` | `Puyuma` 作部落名時指南王；作語言名時需寫 `Puyuma language` 或中文「卑南語」。 |
| 39 | Zhiben_Puyuma | 知本卑南語 | `katratripulr` | 前台部落主用拼法 `Katratripulr`。 |
| 40 | Xiqun_Puyuma | 西群卑南語 | `ulivelivek` | 西群不是單一十社部落名；內容頁需再細分來源部落。 |
| 41 | Jianhe_Puyuma | 建和卑南語 | `kasavakan` | 前台部落主用拼法 `Kasavakan`。 |

## 3. 已建檔資料

| 檔案 | 用途 |
|---|---|
| `data/formosanbank_sources.json` | FormosanBank/ePark 卑南語 CSV、XML 候選來源清單。 |
| `data/audio_manifest_schema.json` | 語音 manifest 欄位規格。 |
| `data/generated/puyuma_audio_seed.json` | 已抽出的少量 seed 例句與音檔 URL。 |
| `scripts/sync_formosanbank_puyuma.py` | 同步 FormosanBank 檔案與 Google Drive folder 音檔。 |
| `scripts/build_puyuma_audio_manifest.py` | 從 CSV/XML 建立平台用音檔 manifest。 |
| `scripts/validate_audio_manifest.py` | 驗證 manifest 欄位與四方言規則。 |

## 4. 平台資料庫建議

### `language_resources`

- `id`
- `language_code`: 固定 `puyuma`
- `dialect_code`: `38` / `39` / `40` / `41`
- `dialect_name`: `Nanwang_Puyuma` / `Zhiben_Puyuma` / `Xiqun_Puyuma` / `Jianhe_Puyuma`
- `community_key`: 對應十社主 key，西群資料可暫用 `ulivelivek` 並另加 `community_scope`
- `category`: 九階教材、情境族語、生活會話篇、族語短文等
- `form`: 卑南語原文
- `translation_zh`: 中文
- `translation_en`: 英文，可空
- `audio_url`: 原始音檔 URL 或平台 CDN URL
- `local_audio_path`: 下載後的本機/物件儲存路徑
- `source_path`: FormosanBank 來源路徑
- `source_row`: CSV row 或 XML 序號
- `license_note`: 來源與授權備註

### API 建議

- `GET /api/language/puyuma/resources?dialect=38&category=情境族語`
- `GET /api/language/puyuma/audio/:id`
- `POST /api/admin/language/import/formosanbank`
- tRPC：`languageResourceRouter.importFormosanBank()`、`languageResourceRouter.listAudioManifest()`

## 5. 音檔處理原則

1. 不要直接把大型 MP3 放進技能包。
2. 建立 `manifest.json` 後，把音檔同步到 R2/CDN。
3. 平台前台使用 CDN URL；後台保留原始 `source_path`、`audio_url` 供追溯。
4. 若 Google Drive 與 CSV 內音檔 URL 同時存在，以 manifest 的 `audio_url` 為原始來源，以 `local_audio_path` 或 `cdn_url` 作實際播放來源。
5. 四方言不得混播；每筆資源必須有 `dialect_code`。

## 6. 驗收

```bash
python3 -m py_compile scripts/sync_formosanbank_puyuma.py scripts/build_puyuma_audio_manifest.py scripts/validate_audio_manifest.py
python3 scripts/validate_audio_manifest.py data/generated/puyuma_audio_seed.json
python3 scripts/validate_package.py
```
