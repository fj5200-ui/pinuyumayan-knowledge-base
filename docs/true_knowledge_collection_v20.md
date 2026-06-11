# v20 真實知識蒐集與去重說明

本版新增 59 筆 source-grounded claims。來源以原民會官方公開資料為主，並保留來源語言、擷取時間、行段定位、敏感等級與發文 guardrail。

## 原則

1. 不把相同 claim 重複寫入。
2. 同一來源行段可以拆成多個知識原子，但必須不同主題、不同用途、不同 canonical_fingerprint。
3. 人口、年度祭儀日期、當代活動屬於會變動資料，必須保存 source_date / captured_at。
4. 祭儀、祖靈、巫法、喪葬、歌謠、狩獵與驅邪相關內容只允許 public_summary_only。
5. 新增文章仍由前端 AI Composer 產生；後端只做來源、去重、敏感、引用與審核。

## 新增資料

- `data/sources/true_source_registry_v20.json`
- `data/content/source_grounded_claims_v20_additions.json`
- `data/content/source_grounded_claims_v20_merged.json`
- `data/content/public_source_grounded_cards_v20.json`
- `data/search/public_search_documents_v20.json`
- `data/ai/frontend_source_packets_v20.json`
- `data/ai/no_duplicate_article_memory_v20.json`
