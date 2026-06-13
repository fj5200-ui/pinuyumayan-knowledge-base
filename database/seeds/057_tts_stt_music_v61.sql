-- v61 main seed marker
CREATE TABLE IF NOT EXISTS tts_stt_music_version_markers (version VARCHAR(16) PRIMARY KEY, description VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
INSERT INTO tts_stt_music_version_markers(version, description) VALUES ('v61','final ledger, legal speech real output gate, search weekly operations, metadata public expansion, governance alert live test, operations notification delivery seal') ON DUPLICATE KEY UPDATE description=VALUES(description);
