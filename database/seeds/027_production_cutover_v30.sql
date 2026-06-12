-- v30 seed: production readiness default blockers and launch policies
INSERT INTO production_readiness_blockers_v30 (blocker_key, category, description, severity, status)
VALUES
('full_corpus_not_verified', 'corpus', 'Full corpus has not yet passed >=1000-entry acceptance; preview-only status must be visible before launch.', 'warning', 'open'),
('hmac_not_enforced_all_internal', 'security', 'All /api/internal/* routes must enforce HMAC + nonce except explicitly documented health/readiness exceptions.', 'blocker', 'open'),
('static_fallback_in_production', 'data_mode', 'Production must not silently use static JSON fallback when DB is unavailable.', 'blocker', 'open'),
('beinan_archaeology_pollution_guard', 'knowledge_safety', 'Beinan/Peinan archaeological site terms must remain blocked from Pinuyumayan culture source packets and related content.', 'blocker', 'open')
ON DUPLICATE KEY UPDATE description=VALUES(description), severity=VALUES(severity), status=VALUES(status);
