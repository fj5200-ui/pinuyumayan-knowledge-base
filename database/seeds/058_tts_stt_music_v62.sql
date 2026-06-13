-- v62 main seed marker
CREATE TABLE IF NOT EXISTS tts_stt_music_version_markers (version VARCHAR(16) PRIMARY KEY, description VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
INSERT INTO tts_stt_music_version_markers(version, description) VALUES ('v62','final ledger write, immutable legal speech release gate, search weekly backfill, metadata public evidence, governance alert audit, operations delivery seal report') ON DUPLICATE KEY UPDATE description=VALUES(description);
