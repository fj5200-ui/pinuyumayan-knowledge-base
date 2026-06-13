-- v62 generated seed placeholder for legal_speech_dataset_real_output_v62
-- Runtime data source: data/*/legal_speech_dataset_real_output_v62.json
CREATE TABLE IF NOT EXISTS tts_stt_music_seed_markers_v62 (seed_key VARCHAR(96) PRIMARY KEY, source_json VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
INSERT IGNORE INTO tts_stt_music_seed_markers_v62(seed_key, source_json) VALUES ('legal_speech_dataset_real_output_v62', 'legal_speech_dataset_real_output_v62.json');
