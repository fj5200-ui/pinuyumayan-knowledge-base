-- v6 seed: main-site API client metadata. Store the actual API key only in environment variables / secret manager.
INSERT INTO api_clients (id, client_key, name_zh, client_type, allowed_scopes_json, allowed_origins_json, status)
VALUES
('api_client_main_site', 'pinuyumayan-main-site', '卑南族文化綜合平台主站', 'main_site',
 JSON_ARRAY('knowledge:read','knowledge:bundle','knowledge:delta','vocabulary:read'),
 JSON_ARRAY('https://pinuyumayan.tw','https://www.pinuyumayan.tw','http://localhost:3000'),
 'active')
ON DUPLICATE KEY UPDATE
  name_zh=VALUES(name_zh),
  allowed_scopes_json=VALUES(allowed_scopes_json),
  allowed_origins_json=VALUES(allowed_origins_json),
  status=VALUES(status);
