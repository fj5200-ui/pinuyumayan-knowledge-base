-- v58 main seed marker
CREATE TABLE IF NOT EXISTS tts_stt_music_version_markers (version VARCHAR(16) PRIMARY KEY, description VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
INSERT INTO tts_stt_music_version_markers(version, description) VALUES ('v58','release certificate seal, dataset v58 gate, formal search config, authority audit, governance RBAC, operations live delivery') ON DUPLICATE KEY UPDATE description=VALUES(description);
