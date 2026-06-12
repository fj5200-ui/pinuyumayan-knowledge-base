-- v42 seed: speech/music ops defaults
INSERT INTO speech_alignment_review_items_v42 (asset_id, dialect_code, license_status, speaker_consent_status, alignment_status, review_status)
VALUES
('preview-audio-001','38','unknown','unknown','missing','candidate_needs_review'),
('preview-audio-002','39','unknown','unknown','missing','candidate_needs_review')
ON DUPLICATE KEY UPDATE review_status=VALUES(review_status);
