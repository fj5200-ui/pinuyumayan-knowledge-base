INSERT INTO api_rate_limit_policies (policy_key, route_pattern, window_seconds, max_requests, created_at)
VALUES
  ('v25_internal_hmac_verify', '/api/internal/security/v25/verify-hmac', 60, 120, CURRENT_TIMESTAMP),
  ('v25_article_review_action', '/api/admin/articles/v25/review-action', 60, 60, CURRENT_TIMESTAMP),
  ('v25_publish_seo_check', '/api/internal/articles/v25/publish-seo-check', 60, 120, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE max_requests = VALUES(max_requests);
