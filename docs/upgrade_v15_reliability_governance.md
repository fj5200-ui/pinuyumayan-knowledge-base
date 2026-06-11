# v15 Reliability Governance Upgrade

v15 strengthens the Pinuyumayan backend database service as a main-site knowledge delivery backend.
It does not change the cultural fact source policy: public endpoints must return only approved, public-safe and source-linked data.

## What v15 adds

- Main-site SLA/SLO tracking for bootstrap, vocabulary, search, delta and export endpoints.
- Contract-test run tables and contract test specification.
- Full corpus reconciliation after FormosanBank/ePark import.
- Payload snapshot metadata with SHA-256 and ETag.
- Search index versioning and relevance evaluation.
- Scoped admin permission grants and security audit events.

## Deployment order

1. Back up the database.
2. Apply `database/migrations/0012_observability_scaling_governance_v15.sql`.
3. Deploy backend code.
4. Verify OpenAPI path count.
5. Run main-site contract tests.
6. Keep full corpus release in `full_corpus_candidate` until reconciliation passes.

## Full corpus rule

The package still embeds only the preview subset. The full corpus must be imported, reconciled and quality-gated before promotion.
