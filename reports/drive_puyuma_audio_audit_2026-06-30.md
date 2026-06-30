# 卑南族音檔對照稽核報告

日期：2026-06-30

## 範圍

- 只檢查卑南族 `Puyuma` 相關音檔。
- 主要對照目標為第二個 Drive 資料夾 `1o_iEc2dbet-cENHLjv86R_b67M0TlakZ`。
- repo 內主要對照來源為 `data/puyuma_full_corpus.json`。

## 驗證結果

- `data/puyuma_full_corpus.json` 中，`Nanwang` + `ILRDF字典` 共 `7073` 筆。
- 這 `7073` 筆的 `audio_file` 皆唯一，範圍從 `Puyuma_0.mp3` 到 `Puyuma_7072.mp3`。
- 其中有 `999` 筆帶有 `drive_id`，且 `drive_id` 也皆唯一。
- 驗證到的尾段檔案可直接對上詞彙內容，例如：
  - `Puyuma_7059.mp3` -> `auka ku i drenan mateka dra kawi i wawai nay muka i Malray?`
  - `Puyuma_7064.mp3` -> `langetriu idru na walark na matulas!`
  - `Puyuma_7072.mp3` -> `yayaran i babalu mu dinsiya!`

## 完成度判讀

- 若以「這次已驗證到的 Puyuma Drive 音檔子集」來算，對照結果可視為 `100%`。
- 若以 repo 內整個 `Nanwang` + `ILRDF字典` 全量 `7073` 筆來算，目前只有 `999/7073` 約 `14.1%` 有 Drive 對應資料。

## 結論

- 你提供的卑南族 `Puyuma` 音檔，repo 內可以確定對應到同一套卑南語詞彙資料。
- 但 repo 的全量卑南語料不等於 Drive 已對應音檔全量，兩者要分開看。
