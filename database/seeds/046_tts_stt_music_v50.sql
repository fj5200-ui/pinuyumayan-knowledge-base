-- generated v50 seed
INSERT IGNORE INTO production_cutover_runs_v50 (run_id, deployment_mode, status, traffic_weight, release_allowed, run_json) VALUES ('v50-seed-contract', 'blue_green', 'contract_seeded', 0, FALSE, CAST('{"seed":"v50"}' AS JSON));
