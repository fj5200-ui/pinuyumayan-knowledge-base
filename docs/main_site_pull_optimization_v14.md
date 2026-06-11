# v14 Main Site Pull Optimization

Recommended main-site strategy:

- Home page: `/api/public/knowledge/bootstrap` with edge cache.
- Search page: `/api/public/knowledge/search` plus `/api/public/search/suggest`.
- Vocabulary page: `/api/public/knowledge/vocabulary` with cursor pagination.
- Static rebuild: `/api/public/knowledge/export/latest` or internal bundle.
- Missed updates: internal delta or sync replay.

Do not request the full corpus as one page. Use cursor pagination or export artifacts.
