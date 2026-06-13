-- v60 main seed marker
CREATE TABLE IF NOT EXISTS tts_stt_music_version_markers (version VARCHAR(16) PRIMARY KEY, description VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
INSERT INTO tts_stt_music_version_markers(version, description) VALUES ('v60','final release certificate seal, immutable dataset freeze, search weekly SLA, metadata source expansion, governance alert closure, operations real delivery') ON DUPLICATE KEY UPDATE description=VALUES(description);
