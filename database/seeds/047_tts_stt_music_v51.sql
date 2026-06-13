
-- v51 main seed marker
INSERT IGNORE INTO production_cutover_observations_v51 (observation_id, actor_id, metric_name, metric_value, status, observation_json)
VALUES ('v51-seed-observation', 'system-seed', 'contract_seed_loaded', 1, 'seeded', JSON_OBJECT('version','v51'));
