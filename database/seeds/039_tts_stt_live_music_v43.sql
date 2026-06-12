INSERT INTO authority_source_fetch_runs_v43 (adapter_id, mode, status, candidate_count, blocked_count, report_json)
VALUES ('v43_seed_preview', 'candidate_only', 'seeded_preview', 0, 0, JSON_OBJECT('note', 'v43 schema seed; real fetch must run on VPS'));
