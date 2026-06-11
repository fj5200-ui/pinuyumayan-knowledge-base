# v12 Multi-site Integration Guide

This backend database service can support the main site, admin console, mobile app, search worker and corpus worker through scoped API clients.

## Recommended consumer pattern

1. Main site SSR calls `/api/public/knowledge/bootstrap` for homepage and navigation.
2. Language pages call `/api/public/knowledge/vocabulary?limit=50&cursor=...`.
3. Search pages call `/api/public/knowledge/search` or consume `public_search_documents.jsonl` export.
4. After publish or full-corpus promotion, the backend emits webhook/revalidation events.
5. If the main site misses a webhook, use `/api/internal/main-site/sync/replay`.

## Scope model

- Main site: `knowledge:read`, `vocabulary:read`, `export:read`.
- Search worker: `search:read`, `export:read`, `export:write`.
- Corpus worker: `corpus:import`, `lineage:write`, `quality:write`, `jobs:write`.

## Cache model

Public data should use ETag and stale-while-revalidate. Preview data must not be cached by public CDNs unless a preview token is included and the response is private.

