-- v52 main seed marker
INSERT IGNORE INTO production_go_live_observations_v52 (sample_id, actor_id, environment, minute_mark, health_ok, p95_latency_ms, error_rate, sample_json)
VALUES ('v52-seed-observation', 'system-seed', 'contract', 0, TRUE, 0, 0, JSON_OBJECT('version','v52'));
