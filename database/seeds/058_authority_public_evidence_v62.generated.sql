-- v62 generated seed placeholder for authority_metadata_public_expansion_v62
-- Runtime data source: data/*/authority_metadata_public_expansion_v62.json
CREATE TABLE IF NOT EXISTS tts_stt_music_seed_markers_v62 (seed_key VARCHAR(96) PRIMARY KEY, source_json VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
INSERT IGNORE INTO tts_stt_music_seed_markers_v62(seed_key, source_json) VALUES ('authority_metadata_public_expansion_v62', 'authority_metadata_public_expansion_v62.json');
