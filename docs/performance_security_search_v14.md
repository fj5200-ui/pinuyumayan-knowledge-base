# v14 Performance, Security, Search Optimization

v14 upgrades the backend database service for production-like operation:

- Public API caching with explicit cache profiles and ETag strategy.
- Scoped internal API operations for cache invalidation and quality gates.
- Search suggestions, facets, synonym rules, and query logging.
- Admin security hardening with MFA schema, password reset token table, lockout policy, and session review endpoint.
- Full corpus retry queue for failed CSV/XML source ingestion.
- Quality gate result table so candidate data does not move directly into public release channels.

## Main site pull rule

The main site should only read public-safe endpoints or internal bundle/delta endpoints with an API key. It should not connect to the database directly.

## Full corpus rule

`preview_subset = 80` remains separate from post-deploy `full_corpus >= 1000`. v14 adds retry and quality gate tables to make the full corpus import safer.
