-- v22 seed: provider config, candidate adapters, cooldown rules
INSERT INTO frontend_ai_provider_configs_v22 (provider_id, display_name, runtime_scope, secret_policy, is_enabled)
VALUES
('local_mock_adapter','Local mock adapter for review tests','main_site_or_browser','no_secret',TRUE),
('openai_responses_adapter','OpenAI Responses adapter','main_site_server_route','never_expose_provider_key_to_browser',TRUE),
('kimi_chat_adapter','Kimi / Moonshot chat adapter','main_site_server_route','never_expose_provider_key_to_browser',TRUE)
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), runtime_scope = VALUES(runtime_scope), secret_policy = VALUES(secret_policy), is_enabled = VALUES(is_enabled);

INSERT INTO knowledge_source_candidate_adapters_v22 (adapter_id, display_name, source_type, status, auto_publish_allowed, requires_manual_verification, notes)
VALUES
('candidate_tipp_pinuyumayan','臺灣原住民族資訊資源網候選來源','public_web_candidate','candidate_only',FALSE,TRUE,'需人工確認來源、授權與是否為卑南族。'),
('candidate_moc_memory_pinuyumayan','文化部／國家文化記憶庫候選來源','public_web_candidate','candidate_only',FALSE,TRUE,'候選資料不得自動發布為 claim。'),
('candidate_taitung_local_government','臺東地方政府候選來源','public_web_candidate','candidate_only',FALSE,TRUE,'需避免卑南文化遺址污染。'),
('blocked_beinan_archaeological_terms','卑南文化遺址禁止關聯詞','blocked_relation_guard','blocked',FALSE,TRUE,'只做 negative disambiguation，不作為卑南族文化來源。')
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), status = VALUES(status), notes = VALUES(notes);
