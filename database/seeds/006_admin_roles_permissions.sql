-- Seed: admin roles and permissions
INSERT INTO admin_roles (id, role_key, name_zh) VALUES
('role_owner','owner','系統擁有者'),
('role_culture_reviewer','culture_reviewer','文化內容審核'),
('role_language_reviewer','language_reviewer','族語/IPA 審核'),
('role_audio_manager','audio_manager','音檔管理'),
('role_import_operator','import_operator','語料匯入操作員'),
('role_viewer','viewer','唯讀查看')
ON DUPLICATE KEY UPDATE name_zh=VALUES(name_zh);

INSERT INTO admin_permissions (id, permission_key, module_key, action_key, description_zh) VALUES
('perm_source_read','source.read','source','read','source.read'),
('perm_source_write','source.write','source','write','source.write'),
('perm_fact_read','fact.read','fact','read','fact.read'),
('perm_fact_write','fact.write','fact','write','fact.write'),
('perm_community_write','community.write','community','write','community.write'),
('perm_ritual_review','ritual.review','ritual','review','ritual.review'),
('perm_corpus_import','corpus.import','corpus','import','corpus.import'),
('perm_corpus_read','corpus.read','corpus','read','corpus.read'),
('perm_corpus_write','corpus.write','corpus','write','corpus.write'),
('perm_audio_review','audio.review','audio','review','audio.review'),
('perm_audio_mirror','audio.mirror','audio','mirror','audio.mirror'),
('perm_tts_review','tts.review','tts','review','tts.review'),
('perm_search_rebuild','search.rebuild','search','rebuild','search.rebuild'),
('perm_review_assign','review.assign','review','assign','review.assign'),
('perm_admin_audit_read','admin.audit.read','admin','audit.read','admin.audit.read')
ON DUPLICATE KEY UPDATE description_zh=VALUES(description_zh);

INSERT INTO admin_role_permissions (role_key, permission_key, granted) VALUES
('owner','source.read',TRUE),
('owner','source.write',TRUE),
('owner','fact.read',TRUE),
('owner','fact.write',TRUE),
('owner','community.write',TRUE),
('owner','ritual.review',TRUE),
('owner','corpus.import',TRUE),
('owner','corpus.read',TRUE),
('owner','corpus.write',TRUE),
('owner','audio.review',TRUE),
('owner','audio.mirror',TRUE),
('owner','tts.review',TRUE),
('owner','search.rebuild',TRUE),
('owner','review.assign',TRUE),
('owner','admin.audit.read',TRUE),
('culture_reviewer','source.read',TRUE),
('culture_reviewer','fact.read',TRUE),
('culture_reviewer','fact.write',TRUE),
('culture_reviewer','ritual.review',TRUE),
('culture_reviewer','review.assign',TRUE),
('language_reviewer','corpus.read',TRUE),
('language_reviewer','corpus.write',TRUE),
('language_reviewer','tts.review',TRUE),
('language_reviewer','review.assign',TRUE),
('audio_manager','corpus.read',TRUE),
('audio_manager','audio.review',TRUE),
('audio_manager','audio.mirror',TRUE),
('import_operator','source.read',TRUE),
('import_operator','corpus.import',TRUE),
('import_operator','search.rebuild',TRUE),
('viewer','source.read',TRUE),
('viewer','fact.read',TRUE),
('viewer','corpus.read',TRUE),
('viewer','admin.audit.read',TRUE)
ON DUPLICATE KEY UPDATE granted=VALUES(granted);
