# TTS/STT Music v48

v48 將 v47 的可操作審核、transaction tests、搜尋觀測、權威來源 adapter、模型治理報表與主站 polish，收斂成部署前後都能檢查的治理層。

## 新增能力

1. VPS MySQL 實機 DB 驗收報告 contract：migration、seed、transaction、rollback、idempotency、audit immutable。
2. 後台完整審核工作台：篩選、批次動作、附件進度、審核歷程抽屜、角色可見性。
3. 搜尋分析看板：daily/weekly metrics、zero-result term queue、facet clicks、p95/p99 alert notification。
4. 權威來源候選合併：相似度群組、引用完整度、metadata-only manual merge。
5. 模型治理可視化：WER/CER/MOS trend、lineage DAG、signoff、blocked-release reasons、Markdown export。
6. 主站視覺完成度：日夜模式 token、WCAG AA 對比、OG/sitemap/Core Web Vitals preflight contract。

## 安全狀態

80 筆 preview speech assets 仍保持 blocked。缺少 license、speaker consent、alignment 與 native speaker review 前，不產生可公開模型或音訊下載。
