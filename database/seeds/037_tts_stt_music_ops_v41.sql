-- v41 seed: default speech dataset and worker configs
INSERT IGNORE INTO puyuma_speech_training_datasets_v41
(dataset_key, dataset_type, release_channel, item_count, train_ready_count, license_approved_count, no_youtube_audio, status, report_json)
VALUES
('puyuma-preview-speech-candidate-v41','tts','speech_training_candidate',80,0,0,TRUE,'candidate_needs_review', JSON_OBJECT('note','Preview only; not train-ready.')),
('puyuma-preview-stt-candidate-v41','stt','speech_training_candidate',80,0,0,TRUE,'candidate_needs_review', JSON_OBJECT('note','Preview only; not train-ready.'));
