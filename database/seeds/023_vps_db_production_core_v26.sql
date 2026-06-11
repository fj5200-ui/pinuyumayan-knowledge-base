-- 023_vps_db_production_core_v26.sql
INSERT IGNORE INTO knowledge_source_candidates_v26
(candidate_key, source_title, source_url, publisher, adapter_key, review_status, reason)
VALUES
('candidate-tipp-pinuyumayan-v26','TIPP 卑南族相關候選來源','https://www.tipp.org.tw/','TIPP 臺灣原住民族資訊資源網','tipp_candidate_adapter','candidate_needs_human_review','Candidate only; not public until human review.'),
('candidate-culture-memory-pinuyumayan-v26','國家文化記憶庫卑南族相關候選來源','https://memory.culture.tw/','文化部 / 國家文化記憶庫','culture_memory_candidate_adapter','candidate_needs_human_review','Candidate only; must exclude archaeology-only Beinan Site records.'),
('candidate-taitung-county-pinuyumayan-v26','臺東縣政府卑南族相關候選來源','https://www.taitung.gov.tw/','臺東縣政府','taitung_county_candidate_adapter','candidate_needs_human_review','Candidate only; local public data needs source review.'),
('blocked-beinan-archaeology-v26','卑南文化遺址禁止關聯候選','https://example.invalid/not-a-source','system blocklist','forbidden_relation_guard','blocked_forbidden_relation','Beinan/Peinan archaeological site terms are not Pinuyumayan cultural knowledge sources.');
