-- v59 main seed marker
CREATE TABLE IF NOT EXISTS tts_stt_music_version_markers (version VARCHAR(16) PRIMARY KEY, description VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
INSERT INTO tts_stt_music_version_markers(version, description) VALUES ('v59','post-seal validation, dataset freeze, production search policy, metadata expansion, governance download hardening, operations notification closed loop') ON DUPLICATE KEY UPDATE description=VALUES(description);
