-- Seed: sources
INSERT INTO kb_sources (id, source_id, title, url, publisher, source_type, license, trust_level, review_status, metadata_json) VALUES
('src_cip_puyuma_profile','cip_puyuma_profile','原住民族委員會：卑南族介紹','https://www.cip.gov.tw/zh-tw/tribe/grid-list/913F9B9D35D49AC3D0636733C6861689/info.html?cumid=8F19BF08AE220D65','原住民族委員會','official','public web page; review before reuse','primary','verified', JSON_OBJECT()),
('src_formosanbank_epark','formosanbank_epark','FormosanBank ePark corpus indexed resources','https://github.com/FormosanBank/FormosanBank','FormosanBank / ILRDF ePark source metadata','dataset','CC-BY-NC-SA metadata appears in XML; commercial use requires review','high','verified', JSON_OBJECT())
ON DUPLICATE KEY UPDATE updated_at=CURRENT_TIMESTAMP;
