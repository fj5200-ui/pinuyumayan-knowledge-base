INSERT INTO main_site_connection_clients_v23 (
  client_id, display_name, site_url, environment, hmac_enabled, allowed_origins, allowed_scopes, status
) VALUES (
  'main-site-production',
  '卑南族文化綜合平台主站',
  'https://pinuyumayan.tw',
  'production',
  TRUE,
  JSON_ARRAY('https://pinuyumayan.tw', 'https://www.pinuyumayan.tw'),
  JSON_ARRAY('knowledge:read', 'vocabulary:read', 'article:validate', 'article:submit_review', 'sync:read'),
  'active'
) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
