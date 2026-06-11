-- 010_content_collections_seed.sql
-- Content items are generated from data/content/main_site_content_packets_v13.json by scripts/build_content_seed_sql.py.

INSERT INTO content_collections (id, name_zh, description, release_channel)
VALUES
  ('home_featured_knowledge','首頁精選知識','主站首頁可拉取的公開摘要集合','preview'),
  ('ten_communities_collection','卑南族十社資料集合','十社資料頁與主站導覽使用','preview'),
  ('ritual_public_summary_collection','祭儀公開摘要集合','僅公開摘要；禁止流程與禁忌推測','preview'),
  ('verified_fact_cards_collection','可追溯事實卡','以 verified facts 產生的短知識卡','public')
ON DUPLICATE KEY UPDATE name_zh=VALUES(name_zh), description=VALUES(description), release_channel=VALUES(release_channel);
