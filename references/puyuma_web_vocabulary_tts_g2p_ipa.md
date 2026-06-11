# 卑南語網站語詞庫：音檔、TTS、G2P、IPA

本檔規範 `data/web/puyuma_vocabulary_audio_entries.json` 的網站使用方式。

## 目前原則

1. **音檔優先使用真人來源音檔 URL**：每筆 entry 必須有 `audio.url`。
2. **MP3 本體不預設打包**：ZIP 保存 URL 與可鏡像路徑，避免容量與授權問題。
3. **TTS 不預設公開開啟**：`tts.enabled_for_public_ui=false`，只能在授權、語言教師審核後開啟。
4. **G2P / IPA 是規則式草稿**：欄位可供搜尋、顯示與後續審核，不可宣稱為權威標音。
5. **完整匯入方式**：執行 `scripts/build_full_puyuma_web_vocabulary.py --download`，會依 `data/web/puyuma_vocabulary_full_source_manifest.json` 抓取 FormosanBank/ePark 的 22 個 CSV 與 44 個 XML 候選來源，產生完整網站語詞庫。

## 主要檔案

- `data/web/puyuma_vocabulary_audio_entries.json`：網站可直接讀取的 entries。
- `data/web/puyuma_vocabulary_full_source_manifest.json`：FormosanBank/ePark 全量候選來源清單。
- `data/web/puyuma_g2p_ipa_rules.json`：G2P/IPA 草稿規則。
- `data/web/puyuma_tts_config.json`：TTS 安全與授權策略。
- `scripts/build_full_puyuma_web_vocabulary.py`：全量建置腳本。
- `scripts/mirror_puyuma_audio_files.py`：授權確認後才可用的 MP3 鏡像腳本。

## 網站欄位

每筆 entry 至少包含：

- `text.puyuma_form`
- `text.zh_tw`
- `audio.url`
- `g2p.phoneme_sequence`
- `ipa.value`
- `tts.tts_text`
- `source.source_path`

## 禁止事項

- 不可用 TTS 仿製耆老、祭師、族人聲音。
- 不可生成祭儀吟唱或敏感語音。
- 不可把規則式 IPA 當作正式教材。
- 不可未經授權大量搬運音檔到商業 CDN。
