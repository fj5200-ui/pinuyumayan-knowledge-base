# Main Site SLA v15

Main-site knowledge delivery should use cached public endpoints for frontend/SSR and internal authenticated endpoints for bundle/delta synchronization.

## Recommended budgets

- `/api/public/knowledge/bootstrap`: p95 <= 800ms
- `/api/public/knowledge/vocabulary`: p95 <= 1000ms
- `/api/internal/main-site/knowledge/delta`: p95 <= 1500ms

## Failure handling

If the main site misses webhook events, use sync replay or delta pull. If export artifacts fail checksum verification, keep the previous public artifact active.
