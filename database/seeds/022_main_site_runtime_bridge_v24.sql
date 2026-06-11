-- v24 seed: required main-site install checks and candidate claims.
INSERT INTO main_site_route_install_checks_v24 (route_path, installed) VALUES
('/api/kb/connection-check', false),
('/api/ai/compose', false),
('/api/ai/validate-draft', false),
('/api/ai/submit-review', false)
ON DUPLICATE KEY UPDATE route_path = VALUES(route_path);

INSERT INTO source_candidate_claims_v24 (claim_id, source_id, title, summary, canonical_fingerprint, review_status, public_use) VALUES ('v24_candidate_claim_001', 'cip_pinuyumayan_official_en', '年齡階級與會所制度', 'CIP 英文頁公開說明卑南族具有嚴謹年齡階級與會所制度，少年會所 Dakuvan 與成年會所 Palakuan 可作為公共生活與教育制度的摘要素材。', '3bb69147e2cea2a89c3708805612285b946cb392f7587904c0492dd8dea25e73', 'candidate_needs_human_review', 'not_public_until_reviewed') ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary);

INSERT INTO source_candidate_claims_v24 (claim_id, source_id, title, summary, canonical_fingerprint, review_status, public_use) VALUES ('v24_candidate_claim_002', 'cip_pinuyumayan_official_en', '歲時祭儀公開月曆', 'CIP 英文頁將 Mugamut、Ruvuwa’an、Masarut、Vasivas、Mangayau 置於年度祭儀摘要；平台僅使用公開摘要，不輸出操作教學。', 'f6bbf73ff256f7be36ebf06bc096ff2375a7f2bb98b2889e717995986080d00e', 'candidate_needs_human_review', 'not_public_until_reviewed') ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary);

INSERT INTO source_candidate_claims_v24 (claim_id, source_id, title, summary, canonical_fingerprint, review_status, public_use) VALUES ('v24_candidate_claim_003', 'cip_pinuyumayan_official_en', '月桃葉食物', 'CIP 英文頁提到節慶時以月桃葉包糯米與鹹豬肉；平台可作飲食文化摘要，不延伸成儀式步驟。', '5dd7482bd424fba8e876b9ebf92155279ea48553bd8ce5d2d9274e03670cc920', 'candidate_needs_human_review', 'not_public_until_reviewed') ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary);

INSERT INTO source_candidate_claims_v24 (claim_id, source_id, title, summary, canonical_fingerprint, review_status, public_use) VALUES ('v24_candidate_claim_004', 'cip_pinuyumayan_official_en', '音樂與現代藝人', 'CIP 英文頁列出多位卑南族音樂/流行音樂人物；平台可做人物索引候選，但需逐筆補個別來源後才公開。', 'a57f708debbbc6dd066fadfb70bc44d8b172ad150f3aebbccd6d3f525fe5e05b', 'candidate_needs_human_review', 'not_public_until_reviewed') ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary);

INSERT INTO source_candidate_claims_v24 (claim_id, source_id, title, summary, canonical_fingerprint, review_status, public_use) VALUES ('v24_candidate_claim_005', 'cip_pinuyumayan_official_en', '族語差異與語言接觸', 'CIP 英文頁提及不同部落與鄰近語言接觸影響發音差異；平台應保留方言/部落脈絡。', '47ab18199719778101d7129eee081093dd3ce1f2d093d1f7a515711911fb6178', 'candidate_needs_human_review', 'not_public_until_reviewed') ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary);

INSERT INTO source_candidate_claims_v24 (claim_id, source_id, title, summary, canonical_fingerprint, review_status, public_use) VALUES ('v24_candidate_claim_006', 'cip_pinuyumayan_official_en', '親屬制度與現代變遷', 'CIP 英文頁說明母系/從妻居傳統與現代變遷；平台應用於制度摘要，不做個人家族推斷。', '8ba7609c9d503014f1cc3a0e4234a385cff83a0315cb07ea10d08de23a7ea739', 'candidate_needs_human_review', 'not_public_until_reviewed') ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary);

INSERT INTO source_candidate_claims_v24 (claim_id, source_id, title, summary, canonical_fingerprint, review_status, public_use) VALUES ('v24_candidate_claim_007', 'cip_pinuyumayan_official_en', '臺東平原中心區域', 'CIP 英文頁列出臺東市與卑南鄉為現代卑南族中心區域，並列主要部落。', '03e85a25f239e5c75adf8e4995f35bb0ddbc56bae8a653ac2056719815c92a58', 'candidate_needs_human_review', 'not_public_until_reviewed') ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary);

INSERT INTO source_candidate_claims_v24 (claim_id, source_id, title, summary, canonical_fingerprint, review_status, public_use) VALUES ('v24_candidate_claim_008', 'cip_pinuyumayan_official_en', '建築公私分類', 'CIP 英文頁說明公共建築與私人建築的分類；平台可做建築文化知識卡。', '5822e78b3cb6425266675a21193f96e129ddbd390972487916c314c2e128dac5', 'candidate_needs_human_review', 'not_public_until_reviewed') ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary);
